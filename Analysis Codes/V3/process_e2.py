#!/usr/bin/env python3
import sys
import os

FEATURE_ID = "E2"
USAGE = f"Usage: python3 process_{FEATURE_ID}.py <E2_hits_file> <analysis_root>"


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


def get_label(path: str) -> str:
    """Turn E2_xxx style into just xxx for output filenames."""
    base = os.path.basename(path)
    prefix = FEATURE_ID + "_"
    if base.startswith(prefix):
        return base[len(prefix):]
    return base


def resolve_output_paths(analysis_root: str, label: str):
    """
    analysis_root is <CWD>/Analysis/<PackageName> from extract_features.py.

    We write:
        <analysis_root>/Scores/E2_score_<label>
        <analysis_root>/Details/E2_detail_<label>
    """
    scores_dir = os.path.join(analysis_root, "Scores")
    details_dir = os.path.join(analysis_root, "Details")
    os.makedirs(scores_dir, exist_ok=True)
    os.makedirs(details_dir, exist_ok=True)

    counts_out = os.path.join(scores_dir, f"{FEATURE_ID}_score_{label}")
    detail_out = os.path.join(details_dir, f"{FEATURE_ID}_detail_{label}")
    return counts_out, detail_out


def main():
    if len(sys.argv) != 3:
        print(USAGE, file=sys.stderr)
        sys.exit(1)

    e2_path = sys.argv[1]
    analysis_root = sys.argv[2]

    if not os.path.exists(e2_path):
        print(f"Error: file not found: {e2_path}", file=sys.stderr)
        sys.exit(1)

    label = get_label(e2_path)
    counts_out, details_out = resolve_output_paths(analysis_root, label)

    entries = parse_e2(e2_path)
    summary = summarize(entries)

    # ---- counts file for scoring ----
    with open(counts_out, "w", encoding="utf-8") as out:
        if summary is None:
            out.write(f"{FEATURE_ID}_total_long_lines=0\n")
            out.write(f"{FEATURE_ID}_bin_100_999=0\n")
            out.write(f"{FEATURE_ID}_bin_1000_9999=0\n")
            out.write(f"{FEATURE_ID}_bin_10000_99999=0\n")
            out.write(f"{FEATURE_ID}_bin_100000_999999=0\n")
            out.write(f"{FEATURE_ID}_bin_ge_1000000=0\n")
        else:
            bins = summary["bins"]
            out.write(f"{FEATURE_ID}_total_long_lines={summary['count']}\n")
            out.write(f"{FEATURE_ID}_bin_100_999={bins['100-999']}\n")
            out.write(f"{FEATURE_ID}_bin_1000_9999={bins['1000-9999']}\n")
            out.write(f"{FEATURE_ID}_bin_10000_99999={bins['10000-99999']}\n")
            out.write(f"{FEATURE_ID}_bin_100000_999999={bins['100000-999999']}\n")
            out.write(f"{FEATURE_ID}_bin_ge_1000000={bins['>=1000000']}\n")

    # ---- detailed summary ----
    with open(details_out, "w", encoding="utf-8") as out:
        if summary is None:
            out.write("=========================================\n")
            out.write("                E2 Summary\n")
            out.write("        Very Long Lines (original file)\n")
            out.write("=========================================\n\n")
            out.write(f"[Args]\n")
            out.write(f"  arg1(E2_hits_file)={e2_path}\n")
            out.write("  arg2(source_file)=N/A\n\n")
            out.write("[Summary]\n")
            out.write("E2_total_long_lines=0\n")
        else:
            out.write("=========================================\n")
            out.write("                E2 Summary\n")
            out.write("        Very Long Lines (original file)\n")
            out.write("=========================================\n\n")
            out.write("[Args]\n")
            out.write(f"  arg1(E2_hits_file)={e2_path}\n")
            out.write("  arg2(source_file)=N/A\n\n")

            out.write("[Summary]\n")
            out.write(f"E2_total_long_lines={summary['count']}\n")
            out.write(f"E2_min_length={summary['min_len']}\n")
            out.write(f"E2_max_length={summary['max_len']}\n")
            out.write(f"E2_avg_length={summary['avg_len']:.2f}\n\n")

            out.write("E2_length_bins(line_counts):\n")
            bins = summary["bins"]
            out.write(f"  100–999 chars:         {bins['100-999']}\n")
            out.write(f"  1,000–9,999 chars:     {bins['1000-9999']}\n")
            out.write(f"  10,000–99,999 chars:   {bins['10000-99999']}\n")
            out.write(f"  100,000–999,999 chars: {bins['100000-999999']}\n")
            out.write(f"  ≥ 1,000,000 chars:     {bins['>=1000000']}\n\n")

            out.write("[Details]\n")
            out.write(f"target_label={label}\n")
            out.write(f"arg1(hits_file)={e2_path}\n")
            out.write("arg2(source_file)=N/A\n\n")

            out.write("[Top longest lines]\n")
            out.write("line_no:length\n")
            for ln, ln_len in summary["top"]:
                out.write(f"  {ln}:{ln_len}\n")

    print(f"[+] {FEATURE_ID} scores written to {counts_out}")
    print(f"[+] {FEATURE_ID} details written to {details_out}")


if __name__ == "__main__":
    main()


