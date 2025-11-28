#!/usr/bin/env python3
import sys
import re
import os
from collections import defaultdict

FEATURE_ID = "C2"
USAGE = f"Usage: python3 process_{FEATURE_ID}.py <C2_hits_file> <analysis_root>"

# Categories:
# - sink_exfil: endpoints commonly used as data sinks / collectors
# - dev_code_host: code/content hosts devs use (raw GH, gists)
# - cloud_auth: cloud identity / token endpoints (AWS/GCP/Azure)
# - other_suspicious: fallback bucket if nothing matches above
CATEGORY_PATTERNS = [
    # Data sinks / exfil collectors
    (
        "sink_exfil",
        re.compile(
            r"(webhook\.site|requestbin|ngrok\.io|discord\.com/api/webhooks|pastebin\.com)",
            re.IGNORECASE,
        ),
    ),
    # Developer-oriented hosting (raw code / gists)
    (
        "dev_code_host",
        re.compile(
            r"(raw\.githubusercontent\.com|gist\.github\.com)",
            re.IGNORECASE,
        ),
    ),
    # Cloud auth / token / identity endpoints
    (
        "cloud_auth",
        re.compile(
            r"(sts\.amazonaws\.com|signin\.aws\.amazon\.com|accounts\.google\.com|"
            r"login\.microsoftonline\.com|graph\.microsoft\.com)",
            re.IGNORECASE,
        ),
    ),
]

ALL_CATEGORIES = ["sink_exfil", "dev_code_host", "cloud_auth", "other_suspicious"]


def classify_line(line: str) -> str:
    """
    Classify a single C2 hit line into exactly one category.
    First matching category wins. If none match, returns 'other_suspicious'.
    """
    for category, pattern in CATEGORY_PATTERNS:
        if pattern.search(line):
            return category
    return "other_suspicious"


def get_label(hits_path: str) -> str:
    """
    Strip leading 'C2_' from basename to get a per-file label.
    Example:
        C2_extraction_home--...--bundle_flow.js.txt -> extraction_home--...--bundle_flow.js.txt
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

    Outputs:
        <analysis_root>/Scores/C2_score_<label>
        <analysis_root>/Details/C2_detail_<label>

    `label` already carries the '.txt' from the hits file, so we do not
    append an extra suffix.
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

    total_hits = 0
    category_counts = {cat: 0 for cat in ALL_CATEGORIES}
    category_lines = defaultdict(list)

    # Read C2 hits and classify each line
    with open(hits_path, "r", encoding="utf-8", errors="replace") as f:
        for raw_line in f:
            line = raw_line.rstrip("\n")
            if not line.strip():
                continue
            total_hits += 1
            category = classify_line(line)
            category_counts[category] += 1
            category_lines[category].append(line)

    # 1) Counts file: C2_score_<label>
    with open(counts_out, "w", encoding="utf-8") as out:
        out.write(f"{FEATURE_ID}_total_hits={total_hits}\n")
        for cat in ALL_CATEGORIES:
            out.write(f"{FEATURE_ID}_{cat}={category_counts.get(cat, 0)}\n")

    # 2) Summary + details file: C2_detail_<label>
    with open(detail_out, "w", encoding="utf-8") as out:
        out.write("===========================================\n")
        out.write("   C2 Suspicious Endpoint Classes\n")
        out.write("===========================================\n\n")
        out.write(f"Source hits file={hits_path}\n")
        out.write("Source code file=N/A\n\n")

        # Summary block
        out.write("[Summary]\n")
        out.write(f"C2_total_hits={total_hits}\n")
        for cat in ALL_CATEGORIES:
            out.write(f"C2_{cat}={category_counts.get(cat, 0)}\n")
        out.write("\n")

        # Details block
        out.write("[Details]\n")
        out.write(f"target_label={label}\n")
        out.write(f"arg1(hits_file)={hits_path}\n")
        out.write("arg2(source_file)=N/A\n\n")

        for cat in ALL_CATEGORIES:
            hits = category_lines.get(cat, [])
            out.write(f"===== {cat} (count={len(hits)}) =====\n\n")
            if not hits:
                out.write("  (none)\n\n")
                continue
            for line in hits:
                out.write(line + "\n")
            out.write("\n")

    print(f"[+] {FEATURE_ID} counts written to {counts_out}")
    print(f"[+] {FEATURE_ID} summary written to {detail_out}")


if __name__ == "__main__":
    main()


