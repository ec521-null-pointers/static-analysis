#!/usr/bin/env python3
import re
import sys
import os
from collections import defaultdict

FEATURE_ID = "B1"

USAGE = f"Usage: python3 process_{FEATURE_ID}.py <B1_hits_file> [source_js_file]"

# ---- Provider classification rules ----
PROVIDER_RULES = {
    "AWS":       r"^AWS_",
    "GCP":       r"^GOOGLE_",
    "GitHub":    r"^GITHUB_",
    "npm":       r"^NPM_",
    "GitLab":    r"^GITLAB_",
    "Azure":     r"^(AZURE_|AZ_)",
    "Vercel":    r"^VERCEL_",
    "Netlify":   r"^NETLIFY_",
    "Heroku":    r"^HEROKU_",
}
DEFAULT_PROVIDER = "Unknown"


def classify_provider(varname: str) -> str:
    for provider, pattern in PROVIDER_RULES.items():
        if re.search(pattern, varname):
            return provider
    return DEFAULT_PROVIDER


def get_label(hits_path: str) -> str:
    """
    Strip leading 'B1_' from basename to get a per-file label.

    Example:
        B1_home--...--bundle_flow.js -> home--...--bundle_flow.js
    """
    base = os.path.basename(hits_path)
    prefix = FEATURE_ID + "_"
    if base.startswith(prefix):
        return base[len(prefix):]
    return base


def main():
    if len(sys.argv) < 2:
        print(USAGE, file=sys.stderr)
        sys.exit(1)

    hits_path = sys.argv[1]
    source_path = sys.argv[2] if len(sys.argv) >= 3 else None

    label = get_label(hits_path)
    counts_out = f"{FEATURE_ID}_hits_{label}"
    detail_out = f"{FEATURE_ID}_2_{label}"

    # Collect secrets
    secret_hits = []                       # raw hits (may contain duplicates)
    provider_map = defaultdict(set)        # provider -> set of secret varnames

    with open(hits_path, "r", encoding="utf-8", errors="ignore") as f:
        for raw in f:
            line = raw.strip()
            if not line:
                continue

            # B1 lines look like: line:offset:process.env.VARNAME
            parts = line.split(":", 2)
            if len(parts) < 3:
                continue

            _, _, text = parts
            m = re.search(r"process\.env\.([A-Za-z0-9_]+)", text)
            if not m:
                continue

            varname = m.group(1)
            secret_hits.append(varname)

            provider = classify_provider(varname)
            provider_map[provider].add(varname)

    unique_secrets = sorted(set(secret_hits))
    n_refs = len(secret_hits)
    n_secrets = len(unique_secrets)
    # Only count providers that actually have at least one secret
    n_providers = sum(1 for s in provider_map.values() if s)

    # Prepare full provider list (including Unknown, even if 0)
    all_providers = list(PROVIDER_RULES.keys()) + [DEFAULT_PROVIDER]

    # ---------- 1) Counts file ----------
    with open(counts_out, "w", encoding="utf-8") as out:
        out.write(f"{FEATURE_ID}_total_refs: {n_refs}\n")
        out.write(f"{FEATURE_ID}_total_secrets: {n_secrets}\n")
        out.write(f"{FEATURE_ID}_total_providers: {n_providers}\n")
        for p in all_providers:
            count_p = len(provider_map.get(p, set()))
            out.write(f"{FEATURE_ID}_{p}: {count_p}\n")

    # ---------- 2) Summary + details ----------
    with open(detail_out, "w", encoding="utf-8") as out:
        out.write("===========================================\n")
        out.write("   B1 Static Credential Feature Summary\n")
        out.write("===========================================\n\n")

        out.write(f"Source hits file : {hits_path}\n")
        out.write(f"Source code file:  {source_path or 'N/A'}\n\n")

        out.write("[Summary]\n")
        out.write(f"B1_total_refs: {n_refs}\n")
        out.write(f"B1_total_secrets: {n_secrets}\n")
        out.write(f"B1_total_providers: {n_providers}\n")
        for p in all_providers:
            count_p = len(provider_map.get(p, set()))
            out.write(f"B1_{p}: {count_p}\n")
        out.write("\n")

        out.write("[Details]\n")
        out.write(f"target_label: {label}\n")
        out.write(f"arg1(hits_file): {hits_path}\n")
        out.write(f"arg2(source_file): {source_path or 'N/A'}\n\n")

        # Providers summary
        out.write("Providers Found:\n")
        if n_providers == 0:
            out.write("  (none)\n\n")
        else:
            for p in all_providers:
                secrets_p = sorted(provider_map.get(p, set()))
                if not secrets_p:
                    continue
                out.write(f"  - {p} ({len(secrets_p)} secrets)\n")
            out.write("\n")

        # Secrets by provider
        out.write("Secrets by Provider:\n")
        if n_providers == 0:
            out.write("  (none)\n")
        else:
            for p in all_providers:
                secrets_p = sorted(provider_map.get(p, set()))
                if not secrets_p:
                    continue
                out.write(f"\n[{p}]  ({len(secrets_p)} secrets)\n")
                for v in secrets_p:
                    out.write(f"  • {v}\n")

        # Raw hits
        out.write("\nRaw Secret Hits (in file order):\n")
        if not secret_hits:
            out.write("  (none)\n")
        else:
            for s in secret_hits:
                out.write(f"  - {s}\n")

    print(f"[+] {FEATURE_ID} counts written to {counts_out}")
    print(f"[+] {FEATURE_ID} summary written to {detail_out}")


if __name__ == "__main__":
    main()


