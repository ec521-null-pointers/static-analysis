#!/usr/bin/env python3
"""
compile_scores.py

Usage:
    python3 compile_scores.py <analysis_root>

Given:
    <analysis_root>/Scores/ contains files like:
        A1_score_<label>.txt
        C2_score_<label>.txt
        ...

This script:
  - Parses all *_score_*.txt files under <analysis_root>/Scores.
  - Builds a metric x file table:
        Col 1  : metric key (e.g. A1_total_sites)
        Col 2+ : one column per file (label), values are ints (0 if missing).
  - Detects missing feature scores per file (e.g. some file has A1/A2 but no C2).
  - Writes:
        <analysis_root>/compile_score.log
        <analysis_root>/files_scanned.log
        <analysis_root>/consolidated_scores.tsv  (tabs)

Columns with all-zero values across all metrics are removed.
"""

import os
import sys
import re
from collections import defaultdict


def parse_score_file(path: str) -> dict:
    """
    Parse a single *_score_*.txt file into {metric_key: int_value}.
    Accepts both "KEY=VALUE" and "KEY: VALUE".
    """
    metrics = {}
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        for raw in f:
            line = raw.strip()
            if not line or line.startswith("#"):
                continue

            if "=" in line:
                key, val = line.split("=", 1)
            elif ":" in line:
                key, val = line.split(":", 1)
            else:
                continue

            key = key.strip()
            val = val.strip()

            # Extract first integer in val
            m = re.match(r"(-?\d+)", val)
            if not m:
                continue
            try:
                ival = int(m.group(1))
            except ValueError:
                continue

            metrics[key] = ival
    return metrics


def main():
    if len(sys.argv) != 2:
        print("Usage: python3 compile_scores.py <analysis_root>", file=sys.stderr)
        sys.exit(1)

    analysis_root = os.path.abspath(sys.argv[1])
    scores_dir = os.path.join(analysis_root, "Scores")

    if not os.path.isdir(scores_dir):
        print(f"[ERROR] Scores directory not found: {scores_dir}", file=sys.stderr)
        sys.exit(1)

    # file_id -> {metric -> value}
    file_scores: dict[str, dict[str, int]] = defaultdict(dict)
    # file_id -> set(features present)
    file_features: dict[str, set[str]] = defaultdict(set)
    # global sets
    all_metrics: set[str] = set()
    all_features: set[str] = set()

    # -------- scan all *_score_*.txt --------
    for fname in os.listdir(scores_dir):
        if not fname.endswith(".txt"):
            continue
        if "_score_" not in fname:
            continue

        feature, rest = fname.split("_score_", 1)
        feature = feature.strip()
        label = rest  # includes .txt
        # we'll use label (without .txt) as the file-id; still unique
        file_id = label[:-4] if label.endswith(".txt") else label

        path = os.path.join(scores_dir, fname)
        metrics = parse_score_file(path)
        if not metrics:
            continue

        all_features.add(feature)
        file_features[file_id].add(feature)

        # merge metrics
        for k, v in metrics.items():
            file_scores[file_id][k] = v
            all_metrics.add(k)

    if not file_scores:
        print("[!] No score files found under", scores_dir, file=sys.stderr)
        sys.exit(0)

    # Sort things
    all_features = sorted(all_features)
    # metrics sorted by feature prefix then by key
    def metric_sort_key(k: str):
        parts = k.split("_", 1)
        prefix = parts[0]
        return (prefix, k)

    metrics_order = sorted(all_metrics, key=metric_sort_key)
    file_ids = sorted(file_scores.keys())

    # -------- detect missing features and column sums --------
    missing_map: dict[str, list[str]] = {}
    col_sums: dict[str, int] = {}

    for fid in file_ids:
        present = file_features.get(fid, set())
        missing = [feat for feat in all_features if feat not in present]
        if missing:
            missing_map[fid] = missing

        # sum over all metrics for this file
        total = sum(file_scores[fid].get(m, 0) for m in metrics_order)
        col_sums[fid] = total

    # columns to keep in the consolidated table (non-zero sum)
    kept_file_ids = [fid for fid in file_ids if col_sums.get(fid, 0) != 0]

    # -------- write compile_score.log --------
    compile_log_path = os.path.join(analysis_root, "compile_score.log")
    with open(compile_log_path, "w", encoding="utf-8") as log:
        log.write("=== compile_score.log ===\n")
        log.write(f"analysis_root={analysis_root}\n")
        log.write(f"total_files_with_scores={len(file_ids)}\n")
        log.write(f"features_observed={','.join(all_features)}\n\n")

        for fid in file_ids:
            missing = missing_map.get(fid, [])
            if missing:
                log.write(f"{fid}: MISSING {','.join(missing)}\n")
            else:
                log.write(f"{fid}: OK (all features present)\n")

        log.write("\nColumns removed from consolidated_scores.tsv "
                  "due to all-zero scores:\n")
        removed = [fid for fid in file_ids if fid not in kept_file_ids]
        if not removed:
            log.write("  (none)\n")
        else:
            for fid in removed:
                log.write(f"  - {fid}\n")

    # -------- write files_scanned.log --------
    files_scanned_path = os.path.join(analysis_root, "files_scanned.log")
    with open(files_scanned_path, "w", encoding="utf-8") as f:
        f.write("=== files_scanned ===\n")
        f.write(f"analysis_root={analysis_root}\n")
        f.write(f"total_files={len(file_ids)}\n\n")

        for fid in file_ids:
            present = sorted(file_features.get(fid, set()))
            missing = missing_map.get(fid, [])
            f.write(f"file={fid}\n")
            f.write(f"  present_features={','.join(present) if present else 'none'}\n")
            f.write(f"  missing_features={','.join(missing) if missing else 'none'}\n")
            f.write("\n")

    # -------- write consolidated_scores.tsv (with a TOTAL column) --------
    table_path = os.path.join(analysis_root, "consolidated_scores.tsv")
    with open(table_path, "w", encoding="utf-8") as t:
        # header: metric | total | file1 | file2 | ...
        header = ["metric", "total"] + kept_file_ids
        t.write("\t".join(header) + "\n")

        # rows
        for metric in metrics_order:
            # compute per-metric total across kept files
            metric_total = sum(
                file_scores.get(fid, {}).get(metric, 0)
                for fid in kept_file_ids
            )

            # metric name + total + each file’s value
            row = [metric, str(metric_total)]
            for fid in kept_file_ids:
                val = file_scores.get(fid, {}).get(metric, 0)
                row.append(str(val))

            t.write("\t".join(row) + "\n")

    print(f"[+] compile_score.log written to {compile_log_path}")
    print(f"[+] files_scanned.log written to {files_scanned_path}")
    print(f"[+] consolidated_scores.tsv written to {table_path}")


if __name__ == "__main__":
    main()


