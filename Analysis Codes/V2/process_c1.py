#!/usr/bin/env python3
"""
process_C1.py

Usage:
    python3 process_C1.py <C1_hits_file> [source_js_file]

Reads:
    - Raw URL hits file (from ripgrep or similar), each line containing 0+ http(s) URLs.

Writes:
    - C1_hits_<label>  (counts vector)
    - C1_2_<label>     (classified summary with per-host details and aggregate stats)
"""

import sys
import re
import os
import ipaddress
import socket
from urllib.parse import urlparse
from collections import defaultdict, OrderedDict

FEATURE_ID = "C1"

# ---------------- URL extraction ----------------
URL_RE = re.compile(r'(https?://\S+)', re.IGNORECASE)

# ---------------- rDNS cache ----------------
_rdns_cache = {}


def reverse_dns(ip_str: str):
    """Return reverse DNS hostname or None (cached)."""
    if ip_str in _rdns_cache:
        return _rdns_cache[ip_str]
    try:
        name = socket.gethostbyaddr(ip_str)[0].rstrip(".").lower()
    except Exception:
        name = None
    _rdns_cache[ip_str] = name
    return name


# ---------------- Domain classifier ----------------
def classify_domain(name: str) -> str:
    host = name.lower().rstrip(".")

    # Dev / source control
    if any(host.endswith(d) for d in (
        "github.com", "githubusercontent.com",
        "gitlab.com", "bitbucket.org",
    )):
        return "DEV_HOST"

    # Package registries
    if any(host.endswith(d) for d in (
        "npmjs.com", "npmjs.org", "yarnpkg.com",
    )):
        return "PACKAGE_INFRA"

    # Cloud / infra
    if any(host.endswith(d) for d in (
        "amazonaws.com", "cloudfront.net",
        "googleapis.com", "gstatic.com", "google.com",
        "azure.com", "microsoft.com",
    )):
        return "CLOUD_PROVIDER"

    # Sinks / paste / canary
    if any(host.endswith(d) for d in (
        "webhook.site",
        "requestcatcher.com",
        "requestbin.net",
        "canarytokens.org",
        "pastebin.com",
        "paste.ee",
        "hastebin.com",
    )):
        return "SINK_SERVICE"

    # Local
    if host in ("localhost", "127.0.0.1", "::1"):
        return "LOCALHOST"

    return "GENERIC_DOMAIN"


# ---------------- Host classifier (IP + rDNS) ----------------
def classify_host_with_rdns(host: str):
    """
    Returns (host_class, rdns or None, is_ip_bool).
    host_class is a *domain-level* bucket (DEV_HOST, CLOUD_PROVIDER, etc.)
    API-level refinement is done later and takes precedence.
    """
    host = host.strip().lower()

    # Try IP first
    try:
        ip = ipaddress.ip_address(host)
        is_ip = True
    except ValueError:
        # Not an IP → treat as domain
        return classify_domain(host), None, False

    # IP-specific buckets
    if ip.is_loopback:
        return "LOCALHOST", None, True

    # Link-local / metadata-ish (e.g., 169.254.x.x, IPv6 link-local)
    if (ip.version == 4 and host.startswith("169.254.")) or ip.is_link_local:
        return "CLOUD_METADATA", None, True

    # Try reverse DNS
    rdns = reverse_dns(host)
    if rdns:
        return classify_domain(rdns), rdns, True

    if ip.is_private:
        return "PRIVATE_IP", None, True
    if ip.is_reserved or ip.is_multicast:
        return "SPECIAL_IP", None, True

    return "PUBLIC_IP", None, True


# ---------------- Helpers ----------------
def extract_line_number(prefix: str):
    """Best-effort: last integer before the URL in the line."""
    m = re.findall(r"(\d+)", prefix)
    return m[-1] if m else "?"


def is_valid_hostname(host: str) -> bool:
    """
    Decide if this looks like a valid host to process.
    - Accepts valid IPs.
    - For domain names: must contain a dot and only allowed chars.
    """
    if not host:
        return False
    h = host.strip().lower()

    # IPs are fine (v4 or v6)
    try:
        ipaddress.ip_address(h)
        return True
    except ValueError:
        pass

    # Domain sanity: needs a dot, and sane chars
    if "." not in h:
        return False
    if not re.match(r"^[a-z0-9._:-]+$", h):
        return False
    return True


def classify_url(parsed):
    """
    API-first classifier.

    1. Use host+path to detect specific APIs (Discord webhooks, raw GH, cloud auth, etc.).
    2. If no API pattern matches, fall back to host-level classification.
    3. Returns (final_class, rdns, is_ip).
    """
    host = (parsed.hostname or "").lower().rstrip(".")
    path = parsed.path or "/"

    # Base host classification (DEV_HOST, CLOUD_PROVIDER, etc.)
    host_cls, rdns, is_ip = classify_host_with_rdns(host or parsed.netloc or "")
    api_cls = None

    # ---- API-level patterns (most specific first) ----
    # Discord webhooks
    if host.endswith("discord.com") and path.startswith("/api/webhooks"):
        api_cls = "API_DISCORD_WEBHOOK"

    # Raw GitHub content / gists
    elif host == "raw.githubusercontent.com":
        api_cls = "API_GITHUB_RAW"
    elif host in ("gist.github.com", "gist.githubusercontent.com"):
        api_cls = "API_GITHUB_GIST"

    # Pastebin (UI vs raw)
    elif host == "pastebin.com":
        if "/raw" in path:
            api_cls = "API_PASTEBIN_RAW"
        else:
            api_cls = "API_PASTEBIN"

    # Webhook / request bins
    elif host == "webhook.site":
        api_cls = "API_WEBHOOK_SITE"
    elif host.endswith("requestbin.net") or host.endswith("requestcatcher.com"):
        api_cls = "API_REQUESTBIN"

    # Cloud auth / tokens
    elif host == "sts.amazonaws.com":
        api_cls = "API_AWS_STS"
    elif host.endswith(".amazonaws.com"):
        api_cls = "API_AWS_GENERIC"
    elif host == "accounts.google.com":
        api_cls = "API_GOOGLE_ACCOUNTS"
    elif host == "login.microsoftonline.com":
        api_cls = "API_MS_LOGIN"
    elif host == "graph.microsoft.com":
        api_cls = "API_MS_GRAPH"

    # Final decision: API class (if any) overrides host class
    final_cls = api_cls or host_cls
    return final_cls, rdns, is_ip


# ---------------- Core processing ----------------
def process_file(path: str):
    hosts = {}
    stats = {
        "raw_url_hits": 0,      # all regex matches
        "valid_url_hits": 0,    # after parsing + hostname validation
        "skipped_urls": 0,      # invalid or malformed hosts
        "ip_urls": 0,
        "domain_urls": 0,
        "class_counts": defaultdict(int),  # per-URL class counts
    }

    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        for raw in f:
            line = raw.rstrip("\n")
            for m in URL_RE.finditer(line):
                url = m.group(1).rstrip('",\' );]}>')
                prefix = line[:m.start()]
                line_no = extract_line_number(prefix)
                stats["raw_url_hits"] += 1

                # Parse URL
                try:
                    parsed = urlparse(url)
                except Exception:
                    stats["skipped_urls"] += 1
                    continue

                host = parsed.hostname
                if not is_valid_hostname(host):
                    stats["skipped_urls"] += 1
                    continue  # skip invalid URL/host

                # API-first classification
                cls, rdns, is_ip = classify_url(parsed)
                stats["valid_url_hits"] += 1
                if is_ip:
                    stats["ip_urls"] += 1
                else:
                    stats["domain_urls"] += 1

                # EXACTLY ONE count per URL hit
                stats["class_counts"][cls] += 1

                # Per-host aggregation (using host string)
                host_key = host.lower()
                if host_key not in hosts:
                    hosts[host_key] = {
                        "class": cls,
                        "rdns": rdns,
                        "hits": [],
                        "is_ip": is_ip,
                    }

                # If host was previously generic, upgrade to more specific class
                if hosts[host_key]["class"] == "GENERIC_DOMAIN" and cls != "GENERIC_DOMAIN":
                    hosts[host_key]["class"] = cls
                if rdns and not hosts[host_key]["rdns"]:
                    hosts[host_key]["rdns"] = rdns

                hosts[host_key]["hits"].append((line_no, url))

    ordered = OrderedDict(
        sorted(hosts.items(), key=lambda kv: (-len(kv[1]["hits"]), kv[0]))
    )
    return ordered, stats


# ---------------- Output helpers ----------------
def get_label(hits_path: str) -> str:
    """
    Strip leading 'C1_' from basename to get a per-file label.

    Example:
        C1_home--...--bundle_flow.js -> home--...--bundle_flow.js
    """
    base = os.path.basename(hits_path)
    prefix = FEATURE_ID + "_"
    if base.startswith(prefix):
        return base[len(prefix):]
    return base


def write_counts(stats, counts_out: str):
    # suspicious IP hits = public IP or cloud metadata
    suspicious_ip_hits = (
        stats["class_counts"].get("PUBLIC_IP", 0)
        + stats["class_counts"].get("CLOUD_METADATA", 0)
    )

    with open(counts_out, "w", encoding="utf-8") as w:
        w.write(f"{FEATURE_ID}_raw_url_hits: {stats['raw_url_hits']}\n")
        w.write(f"{FEATURE_ID}_valid_url_hits: {stats['valid_url_hits']}\n")
        w.write(f"{FEATURE_ID}_skipped_invalid_urls: {stats['skipped_urls']}\n")
        w.write(f"{FEATURE_ID}_ip_url_hits: {stats['ip_urls']}\n")
        w.write(f"{FEATURE_ID}_domain_url_hits: {stats['domain_urls']}\n")
        w.write(f"{FEATURE_ID}_suspicious_ip_hits: {suspicious_ip_hits}\n")

        # per-class counts
        for cls, count in sorted(stats["class_counts"].items()):
            w.write(f"{FEATURE_ID}_{cls}: {count}\n")


def write_summary(hosts, stats, detail_out: str, hits_path: str, source_path: str | None, label: str):
    suspicious_ip_hits = (
        stats["class_counts"].get("PUBLIC_IP", 0)
        + stats["class_counts"].get("CLOUD_METADATA", 0)
    )

    with open(detail_out, "w", encoding="utf-8") as w:
        w.write("===========================================\n")
        w.write("   C1 URL / Domain Feature Summary\n")
        w.write("===========================================\n\n")

        w.write(f"Source hits file : {hits_path}\n")
        w.write(f"Source code file:  {source_path or 'N/A'}\n\n")

        # Summary block
        w.write("[Summary]\n")
        w.write(f"C1_raw_url_hits: {stats['raw_url_hits']}\n")
        w.write(f"C1_valid_url_hits: {stats['valid_url_hits']}\n")
        w.write(f"C1_skipped_invalid_urls: {stats['skipped_urls']}\n")
        w.write(f"C1_ip_url_hits: {stats['ip_urls']}\n")
        w.write(f"C1_domain_url_hits: {stats['domain_urls']}\n")
        w.write(f"C1_suspicious_ip_hits: {suspicious_ip_hits}\n")
        w.write("\nC1_by_class_url_hits:\n")
        for cls, count in sorted(stats["class_counts"].items()):
            w.write(f"  {cls}: {count}\n")
        w.write("\n")

        # Details block
        w.write("[Details]\n")
        w.write(f"target_label: {label}\n")
        w.write(f"arg1(hits_file): {hits_path}\n")
        w.write(f"arg2(source_file): {source_path or 'N/A'}\n\n")

        # Per-host details
        for host, info in hosts.items():
            hits = info["hits"]
            cls = info["class"]
            rdns = info["rdns"]
            count = len(hits)

            if rdns:
                w.write(f"{host} count={count} class={cls} (rdns={rdns})\n")
            else:
                w.write(f"{host} count={count} class={cls}\n")

            for line_no, url in hits:
                w.write(f"  * [line {line_no}] {url}\n")
            w.write("\n")


# ---------------- Entry point ----------------
def main():
    if len(sys.argv) < 2:
        print(f"Usage: python3 process_{FEATURE_ID}.py <C1_hits_file> [source_js_file]")
        sys.exit(1)

    hits_path = sys.argv[1]
    source_path = sys.argv[2] if len(sys.argv) >= 3 else None

    label = get_label(hits_path)
    counts_out = f"{FEATURE_ID}_hits_{label}"
    detail_out = f"{FEATURE_ID}_2_{label}"

    print(f"[+] Processing {hits_path} ...")
    hosts, stats = process_file(hits_path)

    print(f"[+] Writing counts  -> {counts_out}")
    write_counts(stats, counts_out)

    print(f"[+] Writing summary -> {detail_out}")
    write_summary(hosts, stats, detail_out, hits_path, source_path, label)

    print("[+] Done.")


if __name__ == "__main__":
    main()


