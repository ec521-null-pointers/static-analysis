#!/usr/bin/env python3
import sys
import re
import os
from collections import defaultdict

# Auto output path
OUTPUT_PATH = "static_features/C3_2"

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

def classify_line(line: str) -> str:
    """Return the first matching category; otherwise 'other_capability'."""
    for category, pattern in CATEGORY_PATTERNS:
        if pattern.search(line):
            return category
    return "other_capability"


def main():
    if len(sys.argv) != 2:
        print("Usage: python3 analyze_C3.py static_features/C3", file=sys.stderr)
        sys.exit(1)

    input_path = sys.argv[1]

    if not os.path.exists(input_path):
        print(f"Error: file not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    os.makedirs("static_features", exist_ok=True)

    counts = defaultdict(int)

    # Pass 1: classify and count
    with open(input_path, "r", encoding="utf-8", errors="replace") as fin:
        for raw_line in fin:
            line = raw_line.rstrip("\n")
            if not line.strip():
                continue
            category = classify_line(line)
            counts[category] += 1

    total_hits = sum(counts.values())

    # Pass 2: write summary counts
    with open(OUTPUT_PATH, "w", encoding="utf-8") as fout:
        # First line: total
        fout.write(f"total_hits\t{total_hits}\n")
        # Then per-category counts (sorted for stability)
        for category in sorted(counts.keys()):
            fout.write(f"{category}\t{counts[category]}\n")

    print(f"[+] C3 analysis complete → {OUTPUT_PATH}")
    print(f"[+] Total C3 hits: {total_hits}")


if __name__ == "__main__":
    main()

