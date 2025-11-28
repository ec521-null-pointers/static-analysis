#!/usr/bin/env python3
import re
import sys
import os
from collections import defaultdict

FEATURE_ID = "B2"
USAGE = f"Usage: python3 process_{FEATURE_ID}.py <B2_hits_file> <analysis_root>"

# ---------- Provider classification rules ----------
PROVIDER_RULES = {
    "AWS":    r"aws|sts\.amazonaws\.com|aws_",
    "GCP":    r"googleapis\.com|oauth2|google\.com|GOOGLE_",
    "GitHub": r"github\.com|GITHUB_",
    "npm":    r"npmjs\.org|npmjs\.com|\bnpm\b|NPM_TOKEN",
    "GitLab": r"gitlab\.com|GITLAB_",
    "Azure":  r"microsoftonline\.com|login\.windows\.net|AZURE_|AZ_",
}
DEFAULT_PROVIDER = "Unknown"


def classify_provider(text: str) -> str:
    t = text.lower()
    for provider, pattern in PROVIDER_RULES.items():
        if re.search(pattern, t):
            return provider
    return DEFAULT_PROVIDER


def classify_flow_type(text: str) -> str:
    """
    Rough classification of token-related behavior:
      VALIDATE: validation / verification of tokens
      EXCHANGE: OAuth/token exchange / refresh flows
      PUBLISH : behavior around npm publish / login / adduser
      OTHER   : anything else
    """
    t = text.lower()

    # validation / verification
    if re.search(r"validate|verification|verifyidtoken|jwt\.verify|token.*invalid|invalid.*token", t):
        return "VALIDATE"

    # token exchange / refresh
    if "token" in t and re.search(r"oauth|grant_type|exchange|refresh|id_token|access_token", t):
        return "EXCHANGE"

    # npm publish / login / adduser
    if re.search(r"\bnpm\b.*(publish|adduser|login|token)", t):
        return "PUBLISH"

    return "OTHER"


def get_label(hits_path: str) -> str:
    """
    Label is derived from the hits filename only (no full path),
    with the leading 'B2_' stripped if present.

    Example:
        static_features/B2_2025-09-16-@operato_utils-v9.0.51--segmented_bundle.js.txt
        -> label = 2025-09-16-@operato_utils-v9.0.51--segmented_bundle.js.txt
    """
    base = os.path.basename(hits_path)
    prefix = FEATURE_ID + "_"
    if base.startswith(prefix):
        return base[len(prefix):]
    return base


def resolve_output_paths(analysis_root: str, label: str):
    """
    Use the analysis_root passed from extract_features.py.

    analysis_root is already:
        <CWD>/Analysis/<PackageName>

    We place outputs in:
        <analysis_root>/Scores/
        <analysis_root>/Details/

    Output filenames DO NOT add '.txt' because `label`
    already includes the '.txt' from the hits file.
    """
    scores_dir = os.path.join(analysis_root, "Scores")
    details_dir = os.path.join(analysis_root, "Details")
    os.makedirs(scores_dir, exist_ok=True)
    os.makedirs(details_dir, exist_ok=True)

    counts_out = os.path.join(scores_dir, f"{FEATURE_ID}_score_{label}")
    detail_out = os.path.join(details_dir, f"{FEATURE_ID}_detail_{label}")
    return counts_out, detail_out


def main():
    if len(sys.argv) < 3:
        print(USAGE, file=sys.stderr)
        sys.exit(1)

    hits_path = sys.argv[1]
    analysis_root = sys.argv[2]

    label = get_label(hits_path)
    counts_out, detail_out = resolve_output_paths(analysis_root, label)

    # ---------- Parse B2 hits ----------
    events = []  # each: {line_no, provider, flow_type, raw}
    provider_buckets = defaultdict(list)
    flow_buckets = defaultdict(list)

    with open(hits_path, "r", encoding="utf-8", errors="replace") as f:
        for idx, line in enumerate(f, start=1):
            raw = line.rstrip("\n")
            if not raw.strip():
                continue

            provider = classify_provider(raw)
            flow_type = classify_flow_type(raw)

            event = {
                "line_no": idx,
                "provider": provider,
                "flow_type": flow_type,
                "raw": raw,
            }
            events.append(event)
            provider_buckets[provider].append(event)
            flow_buckets[flow_type].append(event)

    total_events = len(events)
    # Only count providers that actually have at least one event
    n_providers = sum(1 for evs in provider_buckets.values() if evs)

    # Fixed lists so counts always appear (even if 0)
    all_providers = list(PROVIDER_RULES.keys()) + [DEFAULT_PROVIDER]
    all_flow_types = ["VALIDATE", "EXCHANGE", "PUBLISH", "OTHER"]

    # ---------- 1) Counts file (machine-readable) ----------
    with open(counts_out, "w", encoding="utf-8") as out:
        out.write(f"{FEATURE_ID}_total_events={total_events}\n")
        out.write(f"{FEATURE_ID}_total_providers={n_providers}\n")
        # per provider
        for p in all_providers:
            count_p = len(provider_buckets.get(p, []))
            out.write(f"{FEATURE_ID}_{p}={count_p}\n")
        # per flow type
        for ft in all_flow_types:
            count_ft = len(flow_buckets.get(ft, []))
            out.write(f"{FEATURE_ID}_{ft}={count_ft}\n")

    # ---------- 2) Summary + details (human-readable) ----------
    with open(detail_out, "w", encoding="utf-8") as out:
        out.write("===========================================\n")
        out.write("   B2 Token Flows / Validation – Layer 2\n")
        out.write("===========================================\n\n")
        out.write(f"Source hits file={hits_path}\n")
        out.write("Source code file=N/A\n\n")

        out.write("[Summary]\n")
        out.write(f"B2_total_events={total_events}\n")
        out.write(f"B2_total_providers={n_providers}\n")
        for p in all_providers:
            out.write(f"B2_{p}={len(provider_buckets.get(p, []))}\n")
        for ft in all_flow_types:
            out.write(f"B2_{ft}={len(flow_buckets.get(ft, []))}\n")
        out.write("\n")

        out.write("[Details]\n")
        out.write(f"target_label={label}\n")
        out.write(f"arg1(hits_file)={hits_path}\n")
        out.write("arg2(source_file)=N/A\n\n")

        out.write("Providers detected:\n")
        if n_providers == 0:
            out.write("  (none)\n\n")
        else:
            for p in all_providers:
                evs = provider_buckets.get(p, [])
                if not evs:
                    continue
                out.write(f"  - {p} (events={len(evs)})\n")
            out.write("\n")

        # Detailed listing per provider
        for p in all_providers:
            ev_list = provider_buckets.get(p, [])
            if not ev_list:
                continue
            out.write(f"===== Provider: {p} (events={len(ev_list)}) =====\n\n")
            for e in ev_list:
                out.write(f"[line {e['line_no']}] type={e['flow_type']}\n")
                out.write(f"  {e['raw']}\n\n")

    print(f"[+] {FEATURE_ID} counts written to {counts_out}")
    print(f"[+] {FEATURE_ID} summary written to {detail_out}")


if __name__ == "__main__":
    main()


