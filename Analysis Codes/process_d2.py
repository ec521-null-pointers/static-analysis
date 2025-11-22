#!/usr/bin/env python3
import sys
import os
from collections import defaultdict

FEATURE_ID = "D2"
USAGE = f"Usage: python3 process_{FEATURE_ID}.py <D2_hits_file> <analysis_root>"

"""
Input (arg1):
    A D2 hits file whose lines look like:
        [PKGWRITE] 123:456:fs.writeFile("package.json", ...)
        [SCRIPTS]  789:012:... "scripts": { ... }
        [HOOKSTR]  345:678:"postinstall"
    (i.e., prefixed by one of [PKGWRITE], [SCRIPTS], [HOOKSTR])

Outputs:
    1) <analysis_root>/Scores/D2_score_<label>
       - counts for each category, one per line:
           D2_total_hits=...
           D2_pkg_json_write=...
           D2_scripts_field_touch=...
           D2_lifecycle_hook_string=...
           D2_unknown_prefix=...

    2) <analysis_root>/Details/D2_detail_<label>
       - human-readable summary + [Details] section with the raw lines
"""

# Internal category keys (fixed order for output)
CAT_PKGWRITE = "pkg_json_write"
CAT_SCRIPTS  = "scripts_field_touch"
CAT_HOOKSTR  = "lifecycle_hook_string"
CAT_UNKNOWN  = "unknown_prefix"

CATEGORY_ORDER = [
    CAT_PKGWRITE,
    CAT_SCRIPTS,
    CAT_HOOKSTR,
    CAT_UNKNOWN,
]

# Mapping from internal key -> output label (with D2_ prefix)
CATEGORY_LABELS = {
    CAT_PKGWRITE: f"{FEATURE_ID}_pkg_json_write",
    CAT_SCRIPTS:  f"{FEATURE_ID}_scripts_field_touch",
    CAT_HOOKSTR:  f"{FEATURE_ID}_lifecycle_hook_string",
    CAT_UNKNOWN:  f"{FEATURE_ID}_unknown_prefix",
}


def get_label(hits_path: str) -> str:
    """
    Strip leading 'D2_' from basename to get a per-file label.

    Example:
        D2_extraction_home--bundle.js.txt -> extraction_home--bundle.js.txt
    """
    base = os.path.basename(hits_path)
    prefix = FEATURE_ID + "_"
    if base.startswith(prefix):
        return base[len(prefix):]
    return base


def resolve_output_paths(analysis_root: str, label: str):
    """
    Use analysis_root from extract_features.py.

    analysis_root = <CWD>/Analysis/<PackageName>

    We write:
        <analysis_root>/Scores/D2_score_<label>
        <analysis_root>/Details/D2_detail_<label>
    """
    scores_dir = os.path.join(analysis_root, "Scores")
    details_dir = os.path.join(analysis_root, "Details")
    os.makedirs(scores_dir, exist_ok=True)
    os.makedirs(details_dir, exist_ok=True)

    counts_out = os.path.join(scores_dir, f"{FEATURE_ID}_score_{label}")
    detail_out = os.path.join(details_dir, f"{FEATURE_ID}_detail_{label}")
    return counts_out, detail_out


def classify_line(line: str) -> str:
    """
    Classify a raw D2 line into one of:
      - pkg_json_write
      - scripts_field_touch
      - lifecycle_hook_string
      - unknown_prefix
    """
    stripped = line.lstrip()
    if stripped.startswith("[PKGWRITE]"):
        return CAT_PKGWRITE
    if stripped.startswith("[SCRIPTS]"):
        return CAT_SCRIPTS
    if stripped.startswith("[HOOKSTR]"):
        return CAT_HOOKSTR
    return CAT_UNKNOWN


def main():
    if len(sys.argv) != 3:
        print(USAGE, file=sys.stderr)
        sys.exit(1)

    input_path = sys.argv[1]
    analysis_root = sys.argv[2]

    if not os.path.exists(input_path):
        print(f"Error: file not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    # Prepare counts and details
    counts = {cat: 0 for cat in CATEGORY_ORDER}
    details = defaultdict(list)

    # Read and classify each line
    with open(input_path, "r", encoding="utf-8", errors="replace") as f:
        for raw_line in f:
            line = raw_line.rstrip("\n")
            if not line.strip():
                continue
            cat = classify_line(line)
            counts[cat] += 1
            details[cat].append(line)

    total_hits = sum(counts.values())
    label = get_label(input_path)
    counts_out, detail_out = resolve_output_paths(analysis_root, label)

    # ---------- 1) Score file: D2_score_<label> ----------
    with open(counts_out, "w", encoding="utf-8") as hf:
        hf.write(f"{FEATURE_ID}_total_hits={total_hits}\n")
        for cat in CATEGORY_ORDER:
            out_label = CATEGORY_LABELS[cat]
            hf.write(f"{out_label}={counts[cat]}\n")

    # ---------- 2) Human-readable summary: D2_detail_<label> ----------
    with open(detail_out, "w", encoding="utf-8") as out:
        out.write("===========================================\n")
        out.write("   D2 – Script / Lifecycle Behaviour\n")
        out.write("===========================================\n\n")
        out.write(f"Source hits file={input_path}\n")
        out.write("Source code file=N/A\n\n")

        out.write("[Summary]\n")
        out.write(f"D2_total_hits={total_hits}\n")
        out.write("D2_category_counts:\n")
        for cat in CATEGORY_ORDER:
            out_label = CATEGORY_LABELS[cat]
            out.write(f"  {out_label}={counts[cat]}\n")
        out.write("\n")

        out.write("[Details]\n")
        out.write(f"target_label={label}\n")
        out.write(f"arg1(hits_file)={input_path}\n")
        out.write("arg2(source_file)=N/A\n\n")

        # Grouped detail lines by category (only show blocks that have hits)
        for cat in CATEGORY_ORDER:
            out_label = CATEGORY_LABELS[cat]
            cat_hits = details[cat]
            out.write(f"== {out_label} (count={len(cat_hits)}) ==\n")
            if not cat_hits:
                out.write("  (no hits)\n\n")
                continue
            for line in cat_hits:
                out.write(line + "\n")
            out.write("\n")

    print(f"[+] {FEATURE_ID} scores written to {counts_out}")
    print(f"[+] {FEATURE_ID} summary written to {detail_out}")


if __name__ == "__main__":
    main()


