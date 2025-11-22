#!/usr/bin/env python3
import re
import sys
import os
from collections import defaultdict

FEATURE_ID = "B1"
USAGE = f"Usage: python3 process_{FEATURE_ID}.py <B1_hits_file> <analysis_root>"

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
    Label is derived from the hits filename only (no full path),
    with the leading 'B1_' stripped if present.

    Example:
        static_features/B1_2025-09-16-@operato_utils-v9.0.51--segmented_bundle.js.txt
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

    # Collect secrets
    secret_hits = []
    provider_map = defaultdict(set)

    with open(hits_path, "r", encoding="utf-8", errors="ignore") as f:
        for raw in f:
            line = raw.strip()
            if not line:
                continue
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
    n_providers = sum(1 for s in provider_map.values() if s)

    all_providers = list(PROVIDER_RULES.keys()) + [DEFAULT_PROVIDER]

    # -------- scores / machine-readable ----------
    with open(counts_out, "w", encoding="utf-8") as out:
        out.write(f"{FEATURE_ID}_total_refs={n_refs}\n")
        out.write(f"{FEATURE_ID}_total_secrets={n_secrets}\n")
        out.write(f"{FEATURE_ID}_total_providers={n_providers}\n")
        for p in all_providers:
            out.write(f"{FEATURE_ID}_{p}={len(provider_map.get(p, set()))}\n")

    # -------- human-readable detail ----------
    with open(detail_out, "w", encoding="utf-8") as out:
        out.write("===========================================\n")
        out.write("   B1 Static Credential Feature Summary\n")
        out.write("===========================================\n\n")
        out.write(f"Source_hits_file={hits_path}\n")
        out.write("Source_code_file=N/A\n\n")

        out.write("[Summary]\n")
        out.write(f"B1_total_refs={n_refs}\n")
        out.write(f"B1_total_secrets={n_secrets}\n")
        out.write(f"B1_total_providers={n_providers}\n")
        for p in all_providers:
            out.write(f"B1_{p}={len(provider_map.get(p, set()))}\n")
        out.write("\n")

        out.write("[Details]\n")
        out.write(f"target_label={label}\n")
        out.write(f"arg1(hits_file)={hits_path}\n")
        out.write("arg2(source_file)=N/A\n\n")

        out.write("Providers Found:\n")
        if n_providers == 0:
            out.write("  (none)\n\n")
        else:
            for p in all_providers:
                s = sorted(provider_map.get(p, set()))
                if s:
                    out.write(f"  - {p} ({len(s)})\n")
            out.write("\n")

        out.write("Secrets by Provider:\n")
        if n_providers == 0:
            out.write("  (none)\n")
        else:
            for p in all_providers:
                s = sorted(provider_map.get(p, set()))
                if not s:
                    continue
                out.write(f"\n[{p}] ({len(s)})\n")
                for v in s:
                    out.write(f"  • {v}\n")

        out.write("\nRaw_hits_in_order:\n")
        if not secret_hits:
            out.write("  (none)\n")
        else:
            for s in secret_hits:
                out.write(f"  - {s}\n")

    print(f"[+] {FEATURE_ID} scores → {counts_out}")
    print(f"[+] {FEATURE_ID} details → {detail_out}")


if __name__ == "__main__":
    main()


