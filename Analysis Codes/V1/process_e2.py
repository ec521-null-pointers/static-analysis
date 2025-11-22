#!/usr/bin/env python3
import sys

"""
process_E2.py

Usage:
    python3 process_E2.py static_features/E2

Input (E2):
    Lines of the form:  <line_number>:<length>
    e.g.
        2:3734611
        5:12034

Output:
    E2_2  - summary of very long lines, with length bins.
"""


def parse_e2(path):
    """Parse E2 into list of (line_no, length)."""
    entries = []  # list of (line_no, length)
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        for raw in f:
            line = raw.strip()
            if not line or ":" not in line:
                continue
            left, right = line.split(":", 1)
            try:
                ln = int(left.strip())
                ln_len = int(right.strip())
            except ValueError:
                continue
            entries.append((ln, ln_len))
    return entries


def summarize(entries):
    if not entries:
        return None

    num = len(entries)
    lengths = [l for _, l in entries]

    total_len = sum(lengths)
    min_len = min(lengths)
    max_len = max(lengths)
    avg_len = total_len / num if num else 0.0

    # Bin counts by length
    bins = {
        "100-999": 0,
        "1000-9999": 0,
        "10000-99999": 0,
        "100000-999999": 0,
        ">=1000000": 0,
    }

    for l in lengths:
        if 100 <= l < 1000:
            bins["100-999"] += 1
        elif 1000 <= l < 10_000:
            bins["1000-9999"] += 1
        elif 10_000 <= l < 100_000:
            bins["10000-99999"] += 1
        elif 100_000 <= l < 1_000_000:
            bins["100000-999999"] += 1
        elif l >= 1_000_000:
            bins[">=1000000"] += 1

    # top N longest lines (default 10)
    N = 10
    top = sorted(entries, key=lambda x: x[1], reverse=True)[:N]

    return {
        "count": num,
        "min_len": min_len,
        "max_len": max_len,
        "avg_len": avg_len,
        "bins": bins,
        "top": top,
    }


def write_summary(summary, out_path="E2_2"):
    with open(out_path, "w", encoding="utf-8") as out:
        if summary is None:
            out.write("No long lines found in E2.\n")
            return

        out.write("=========================================\n")
        out.write("                E2 Summary\n")
        out.write("        Very Long Lines (original file)\n")
        out.write("=========================================\n\n")

        out.write(f"Total long lines (from E2): {summary['count']}\n")
        out.write(f"Min length:  {summary['min_len']}\n")
        out.write(f"Max length:  {summary['max_len']}\n")
        out.write(f"Avg length:  {summary['avg_len']:.2f}\n\n")

        out.write("Length bins (line counts):\n")
        bins = summary["bins"]
        out.write(f"  100–999 chars:          {bins['100-999']}\n")
        out.write(f"  1,000–9,999 chars:      {bins['1000-9999']}\n")
        out.write(f"  10,000–99,999 chars:    {bins['10000-99999']}\n")
        out.write(f"  100,000–999,999 chars:  {bins['100000-999999']}\n")
        out.write(f"  ≥ 1,000,000 chars:      {bins['>=1000000']}\n\n")

        out.write("Top longest lines (line_no:length):\n")
        for ln, ln_len in summary["top"]:
            out.write(f"  line {ln}: {ln_len}\n")


def main():
    if len(sys.argv) != 2:
        print("Usage: python3 process_E2.py static_features/E2")
        sys.exit(1)

    e2_path = sys.argv[1]
    entries = parse_e2(e2_path)
    summary = summarize(entries)
    write_summary(summary, out_path="E2_2")
    print("[+] Wrote E2 summary to E2_2")


if __name__ == "__main__":
    main()


