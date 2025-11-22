#!/usr/bin/env python3
import sys
import re
import os
from collections import defaultdict

FEATURE_ID = "C3"
USAGE = f"Usage: python3 process_{FEATURE_ID}.py <C3_hits_file> <analysis_root>"

# Categories: in priority order (first match wins)
CATEGORY_PATTERNS = [
    # 1. Child process / OS commands
    (
        "proc_child_exec",
        re.compile(
            r"(child_process\.exec|child_process\.execFile|child_process\.spawn|execSync|spawnSync)",
            re.IGNORECASE,
        ),
    ),
    # 2. High-level network APIs
    ("net_fetch", re.compile(r"\bfetch\s*\(", re.IGNORECASE)),
    ("net_xmlhttprequest", re.compile(r"new\s+XMLHttpRequest", re.IGNORECASE)),
    ("net_websocket", re.compile(r"new\s+WebSocket", re.IGNORECASE)),
    # 3. Node core networking modules
    (
        "net_node_http_module",
        re.compile(r"require\(\s*['\"](http|https|net|tls)['\"]\s*\)", re.IGNORECASE),
    ),
    (
        "net_node_dns_module",
        re.compile(r"require\(\s*['\"]dns['\"]\s*\)", re.IGNORECASE),
    ),
    # 4. Generic .request()
    ("net_generic_request", re.compile(r"\.request\s*\(", re.IGNORECASE)),
    # 5. Fallback .exec() (regex / misc)
    ("generic_exec_like", re.compile(r"\.exec\s*\(", re.IGNORECASE)),
]

ALL_CATEGORIES = [
    "proc_child_exec",
    "net_fetch",
    "net_xmlhttprequest",
    "net_websocket",
    "net_node_http_module",
    "net_node_dns_module",
    "net_generic_request",
    "generic_exec_like",
    "other_capability",
]


def classify_line(line: str) -> str:
    """Return the first matching category; otherwise 'other_capability'."""
    for category, pattern in CATEGORY_PATTERNS:
        if pattern.search(line):
            return category
    return "other_capability"


def get_label(hits_path: str) -> str:
    """
    Strip leading 'C3_' from basename to get a per-file label.
    Example:
        C3_extraction_home--...--bundle_flow.js.txt
        -> extraction_home--...--bundle_flow.js.txt
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
        <analysis_root>/Scores/C3_score_<label>
        <analysis_root>/Details/C3_detail_<label>
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

    if not os.path.exists(hits_path):
        print(f"Error: file not found: {hits_path}", file=sys.stderr)
        sys.exit(1)

    label = get_label(hits_path)
    counts_out, detail_out = resolve_output_paths(analysis_root, label)

    # Counters and line buckets
    counts = {cat: 0 for cat in ALL_CATEGORIES}
    buckets = defaultdict(list)
    total_hits = 0

    # Pass 1: classify and count
    with open(hits_path, "r", encoding="utf-8", errors="replace") as fin:
        for raw_line in fin:
            line = raw_line.rstrip("\n")
            if not line.strip():
                continue
            total_hits += 1
            category = classify_line(line)
            counts[category] += 1
            buckets[category].append(line)

    # 1) Counts file: C3_score_<label>
    with open(counts_out, "w", encoding="utf-8") as fout:
        fout.write(f"{FEATURE_ID}_total_hits={total_hits}\n")
        for cat in ALL_CATEGORIES:
            fout.write(f"{FEATURE_ID}_{cat}={counts.get(cat, 0)}\n")

    # 2) Summary + details: C3_detail_<label>
    with open(detail_out, "w", encoding="utf-8") as fout:
        fout.write("===========================================\n")
        fout.write("   C3 Network / Exec Capability Summary\n")
        fout.write("===========================================\n\n")
        fout.write(f"Source hits file={hits_path}\n")
        fout.write("Source code file=N/A\n\n")

        # Summary block
        fout.write("[Summary]\n")
        fout.write(f"C3_total_hits={total_hits}\n")
        for cat in ALL_CATEGORIES:
            fout.write(f"C3_{cat}={counts.get(cat, 0)}\n")
        fout.write("\n")

        # Details block
        fout.write("[Details]\n")
        fout.write(f"target_label={label}\n")
        fout.write(f"arg1(hits_file)={hits_path}\n")
        fout.write("arg2(source_file)=N/A\n\n")

        for cat in ALL_CATEGORIES:
            lines = buckets.get(cat, [])
            fout.write(f"===== {cat} (count={len(lines)}) =====\n\n")
            if not lines:
                fout.write("  (none)\n\n")
                continue
            for line in lines:
                fout.write(line + "\n")
            fout.write("\n")

    print(f"[+] {FEATURE_ID} counts written to {counts_out}")
    print(f"[+] {FEATURE_ID} summary written to {detail_out}")


if __name__ == "__main__":
    main()


