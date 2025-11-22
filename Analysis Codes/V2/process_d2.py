#!/usr/bin/env python3
import sys
import os
from collections import defaultdict

"""
process_D2.py  (formerly "script manipulation" for D3, now D2)

Usage:
    python3 process_D2.py static_features/D2

Input (arg1):
    A D2 hits file whose lines look like:
        [PKGWRITE] 123:456:fs.writeFile("package.json", ...)
        [SCRIPTS]  789:012:... "scripts": { ... }
        [HOOKSTR]  345:678:"postinstall"
    (i.e., prefixed by one of [PKGWRITE], [SCRIPTS], [HOOKSTR])

Outputs:
    1) D2_hits_<sanitized-arg1>
       - pure counts for each category, one per line:
           D2_pkg_json_write: N
           D2_scripts_field_touch: M
           D2_lifecycle_hook_string: K
           D2_unknown_prefix: X

    2) D2_2
       - human-readable summary + [Details] section with the raw lines
"""

USAGE = "Usage: python3 process_D2.py static_features/D2"

# Internal category keys (fixed order for output)
CAT_PKGWRITE   = "pkg_json_write"
CAT_SCRIPTS    = "scripts_field_touch"
CAT_HOOKSTR    = "lifecycle_hook_string"
CAT_UNKNOWN    = "unknown_prefix"

CATEGORY_ORDER = [
    CAT_PKGWRITE,
    CAT_SCRIPTS,
    CAT_HOOKSTR,
    CAT_UNKNOWN,
]

# Mapping from internal key -> output label (with D2_ prefix)
CATEGORY_LABELS = {
    CAT_PKGWRITE: "D2_pkg_json_write",
    CAT_SCRIPTS: "D2_scripts_field_touch",
    CAT_HOOKSTR: "D2_lifecycle_hook_string",
    CAT_UNKNOWN: "D2_unknown_prefix",
}


def sanitize_label(path: str) -> str:
    """
    Turn a file path into a flat label:
    - replace path separators '/' and '\' with '--'
    - leave other characters as-is
    """
    label = path.replace(os.sep, "--")
    label = label.replace("\\", "--")
    return label


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
    if len(sys.argv) != 2:
        print(USAGE, file=sys.stderr)
        sys.exit(1)

    input_path = sys.argv[1]
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

    # ---------- 1) Write hits file: D2_hits_<sanitized-arg1> ----------
    label = sanitize_label(input_path)
    hits_filename = f"D2_hits_{label}"
    with open(hits_filename, "w", encoding="utf-8") as hf:
        for cat in CATEGORY_ORDER:
            out_label = CATEGORY_LABELS[cat]
            hf.write(f"{out_label}: {counts[cat]}\n")

    # ---------- 2) Write human-readable summary: D2_2 ----------
    summary_path = "D2_2"
    with open(summary_path, "w", encoding="utf-8") as out:
        out.write("===========================================\n")
        out.write("          D2 – Script / Lifecycle Behaviour\n")
        out.write("===========================================\n\n")

        out.write(f"file_label: {label}\n")
        out.write(f"arg1 (hits file): {input_path}\n")
        out.write("arg2 (source file): N/A\n\n")

        out.write(f"Total D2 hits: {total_hits}\n\n")

        out.write("Category counts:\n")
        for cat in CATEGORY_ORDER:
            out_label = CATEGORY_LABELS[cat]
            out.write(f"  {out_label}: {counts[cat]}\n")

        out.write("\n[Details]\n")
        out.write(f"file_label: {label}\n")
        out.write(f"arg1 (hits file): {input_path}\n")
        out.write("arg2 (source file): N/A\n\n")

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

    print(f"[+] D2 counts written to {hits_filename}")
    print(f"[+] D2 summary written to {summary_path}")


if __name__ == "__main__":
    main()
```0


