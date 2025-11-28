#!/usr/bin/env python3
"""
compile_scores.py
Usage:
    python3 compile_scores.py <analysis_root> [extracted_root]

Example:
    python3 compile_scores.py npm_top_10k/Analysis npm_top_10k/extracted

Expected layout:
    <analysis_root>/ (e.g. npm_top_10k/Analysis)
      pkgA/
        static_features/
          A1_score_bundle.js.txt
          C2_score_bundle.js.txt
          ...
      pkgB/
        static_features/
          ...

If [extracted_root] is provided, we also expect:
    <extracted_root>/<pkg_name>/  (original extracted package contents)

For each package directory <analysis_root>/<pkg>/, this script:
  - Recursively finds all files matching "*_score_*.txt".
  - Parses them into {metric_key: int_value}.
  - Treats each *_score_*.txt as one "file-id" (label), using:
        feature, rest = fname.split("_score_", 1)
        file_id = rest without ".txt"
  - Tries to map each file_id to the underlying "scored" source file in
    the SAME directory as the *_score_*.txt file:
        1) <dir>/<file_id> if exists
        2) if file_id has no '.', try extensions: .js, .mjs, .cjs, .ts, .jsx, .tsx, .json
        3) fallback: first file in <dir> whose name starts with file_id
  - Uses the size of that source file (bytes) as the "file size" for density metrics.
  - Computes:
        * per-file metric values
        * per-metric totals
        * per-file source-file sizes
        * total package size in bytes:

          - If extracted_root is provided and <extracted_root>/<pkg_name> exists:
                PACKAGE_SIZE_BYTES = sum of all files under that directory.
          - Otherwise (backwards compatible):
                PACKAGE_SIZE_BYTES = sum of all files under the analysis pkg dir.

  - Writes per-package:
        <pkg>/consolidated_scores.tsv
        <pkg>/compile_score.log
        <pkg>/files_scanned.log

    consolidated_scores.tsv schema:
        metric  total   file1   file2   ...
      including special rows:
        FILESIZE_bytes      (total = sum of source-file sizes; per-file = size of source file)
        PACKAGE_SIZE_BYTES  (total = package size bytes; per-file columns = 0)

Additionally, at the root <analysis_root>, it:
  - Aggregates per-package TOTAL values into a global table:
        row = one package
        cols = metrics (including FILESIZE_bytes, PACKAGE_SIZE_BYTES)
  - Writes:
        <analysis_root>/Consolidated_Package_Scores.tsv
        <analysis_root>/compile_scores_root.log
"""
import os
import sys
import re
from collections import defaultdict


def parse_score_file(path: str) -> dict:
    """
    Parse a single *_score_*.txt file into {metric_key: int_value}.
    Accepts both "KEY=VALUE" and "KEY: VALUE".
    Ignores lines without an integer value.
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


def metric_sort_key(k: str):
    """Group metrics by prefix (e.g. A1_, C2_) then full key."""
    parts = k.split("_", 1)
    prefix = parts[0]
    return (prefix, k)


def compute_package_size_bytes(pkg_dir: str) -> int:
    """Sum size of all files under pkg_dir (recursively)."""
    total = 0
    for root, dirs, files in os.walk(pkg_dir):
        for fname in files:
            fpath = os.path.join(root, fname)
            try:
                total += os.path.getsize(fpath)
            except OSError:
                continue
    return total


def find_source_file_for_score(score_file_path: str, file_id: str) -> str | None:
    """
    Given a *_score_*.txt file path and the derived file_id (label),
    try to locate the underlying 'scored' source file in the same directory.
    Strategy:
        1) <dir>/<file_id> if exists
        2) if file_id has no '.', try file_id + ext for common JS/JSON-like extensions
        3) fallback: first file in <dir> whose name startswith(file_id)
    Returns absolute path to source file, or None if not found.
    """
    base_dir = os.path.dirname(score_file_path)

    # 1) exact match
    cand = os.path.join(base_dir, file_id)
    if os.path.isfile(cand):
        return cand

    # 2) try common extensions if file_id has no dot (no extension)
    if "." not in file_id:
        exts = [".js", ".mjs", ".cjs", ".ts", ".jsx", ".tsx", ".json"]
        for ext in exts:
            cand = os.path.join(base_dir, file_id + ext)
            if os.path.isfile(cand):
                return cand

    # 3) fallback: any file starting with file_id
    try:
        for fname in os.listdir(base_dir):
            if fname.startswith(file_id):
                cand = os.path.join(base_dir, fname)
                if os.path.isfile(cand):
                    return cand
    except OSError:
        pass

    return None


def process_single_package(pkg_dir: str, extracted_root: str | None = None):
    """
    Process one package directory:

      pkg_dir        : Analysis/<pkg_name>
      extracted_root : optional path to the root of extracted packages.
                       If provided and <extracted_root>/<pkg_name> exists,
                       PACKAGE_SIZE_BYTES is computed from that directory.
                       Otherwise we fall back to pkg_dir (Analysis).

      - Find all *_score_*.txt under pkg_dir.
      - Build per-file metric table and write:
            consolidated_scores.tsv
            compile_score.log
            files_scanned.log
      - Return:
            per_pkg_totals: {metric -> total_over_all_files_for_this_pkg}
            warnings: list[str] (unused for now)
    """
    pkg_name = os.path.basename(pkg_dir)

    # Decide which directory to use for PACKAGE_SIZE_BYTES
    if extracted_root is not None:
        src_pkg_dir = os.path.join(extracted_root, pkg_name)
        if os.path.isdir(src_pkg_dir):
            package_size_bytes = compute_package_size_bytes(src_pkg_dir)
        else:
            # Fallback if the extracted package dir is missing
            package_size_bytes = compute_package_size_bytes(pkg_dir)
    else:
        # Backwards-compatible behaviour: use analysis dir
        package_size_bytes = compute_package_size_bytes(pkg_dir)

    # file_id -> {metric -> value}
    file_scores: dict[str, dict[str, int]] = defaultdict(dict)
    # file_id -> set(features present)
    file_features: dict[str, set[str]] = defaultdict(set)
    # file_id -> size of the *source* file being scored (bytes)
    file_sizes: dict[str, int] = {}
    # file_id -> path of the source file (for logging; optional)
    file_src_paths: dict[str, str] = {}
    # global sets for this package (for metrics/features)
    all_metrics: set[str] = set()
    all_features: set[str] = set()

    # Recursively find *_score_*.txt
    score_files = []
    for root, dirs, files in os.walk(pkg_dir):
        for fname in files:
            if not fname.endswith(".txt"):
                continue
            if "_score_" not in fname:
                continue
            score_files.append(os.path.join(root, fname))

    if not score_files:
        # Nothing to parse for this package
        return {}, [f"[{pkg_name}] no *_score_*.txt files found"]

    # --- parse each score file ---
    for sf in score_files:
        fname = os.path.basename(sf)
        try:
            feature, rest = fname.split("_score_", 1)
        except ValueError:
            # Not in expected pattern, skip
            continue
        feature = feature.strip()
        label = rest  # includes .txt
        file_id = label[:-4] if label.endswith(".txt") else label

        metrics = parse_score_file(sf)
        if not metrics:
            continue

        all_features.add(feature)
        file_features[file_id].add(feature)

        # record source-file size (bytes) for this file_id (first seen wins)
        if file_id not in file_sizes:
            src = find_source_file_for_score(sf, file_id)
            if src is not None:
                file_src_paths[file_id] = src
                try:
                    file_sizes[file_id] = os.path.getsize(src)
                except OSError:
                    file_sizes[file_id] = 0
            else:
                file_src_paths[file_id] = ""
                file_sizes[file_id] = 0

        for k, v in metrics.items():
            file_scores[file_id][k] = v
            all_metrics.add(k)

    if not file_scores:
        return {}, [f"[{pkg_name}] *_score_*.txt files found but no metrics parsed"]

    all_features_sorted = sorted(all_features)
    metrics_order = sorted(all_metrics, key=metric_sort_key)
    file_ids = sorted(file_scores.keys())

    # --- detect missing features & column sums for this package ---
    missing_map: dict[str, list[str]] = {}
    col_sums: dict[str, int] = {}

    for fid in file_ids:
        present = file_features.get(fid, set())
        missing = [feat for feat in all_features_sorted if feat not in present]
        if missing:
            missing_map[fid] = missing
        total = sum(file_scores[fid].get(m, 0) for m in metrics_order)
        col_sums[fid] = total

    # columns to keep in the per-package table (non-zero sum)
    kept_file_ids = [fid for fid in file_ids if col_sums.get(fid, 0) != 0]

    # --- per-package logs & table paths ---
    pkg_compile_log = os.path.join(pkg_dir, "compile_score.log")
    pkg_files_scanned = os.path.join(pkg_dir, "files_scanned.log")
    pkg_table = os.path.join(pkg_dir, "consolidated_scores.tsv")

    # --- write compile_score.log (per-package) ---
    with open(pkg_compile_log, "w", encoding="utf-8") as log:
        log.write("=== compile_score.log ===\n")
        log.write(f"package={pkg_name}\n")
        log.write(f"pkg_dir={pkg_dir}\n")
        log.write(f"package_size_bytes={package_size_bytes}\n")
        log.write(f"total_files_with_scores={len(file_ids)}\n")
        log.write(f"features_observed={','.join(all_features_sorted)}\n\n")
        for fid in file_ids:
            missing = missing_map.get(fid, [])
            src_path = file_src_paths.get(fid, "")
            size_bytes = file_sizes.get(fid, 0)
            if missing:
                log.write(f"{fid}: MISSING {','.join(missing)}\n")
            else:
                log.write(f"{fid}: OK (all features present)\n")
            log.write(f"    src_file={src_path or '(not found)'} size_bytes={size_bytes}\n")
        log.write("\nColumns removed from consolidated_scores.tsv "
                  "due to all-zero scores:\n")
        removed = [fid for fid in file_ids if fid not in kept_file_ids]
        if not removed:
            log.write("  (none)\n")
        else:
            for fid in removed:
                log.write(f"  - {fid}\n")

    # --- write files_scanned.log (per-package) ---
    with open(pkg_files_scanned, "w", encoding="utf-8") as f:
        f.write("=== files_scanned ===\n")
        f.write(f"package={pkg_name}\n")
        f.write(f"pkg_dir={pkg_dir}\n")
        f.write(f"package_size_bytes={package_size_bytes}\n")
        f.write(f"total_files={len(file_ids)}\n\n")
        for fid in file_ids:
            present = sorted(file_features.get(fid, set()))
            missing = missing_map.get(fid, [])
            size_bytes = file_sizes.get(fid, 0)
            src_path = file_src_paths.get(fid, "")
            f.write(f"file={fid}\n")
            f.write(f"  src_file={src_path or '(not found)'}\n")
            f.write(f"  score_source_size_bytes={size_bytes}\n")
            f.write(f"  present_features={','.join(present) if present else 'none'}\n")
            f.write(f"  missing_features={','.join(missing) if missing else 'none'}\n")
            f.write("\n")

    # --- write consolidated_scores.tsv (per package, with SPECIAL SIZE ROWS) ---
    per_pkg_totals: dict[str, int] = {}
    with open(pkg_table, "w", encoding="utf-8") as t:
        # header: metric | total | file1 | file2 | ...
        header = ["metric", "total"] + kept_file_ids
        t.write("\t".join(header) + "\n")

        # normal metric rows
        for metric in metrics_order:
            metric_total = sum(
                file_scores.get(fid, {}).get(metric, 0)
                for fid in kept_file_ids
            )
            per_pkg_totals[metric] = metric_total
            row = [metric, str(metric_total)]
            for fid in kept_file_ids:
                val = file_scores.get(fid, {}).get(metric, 0)
                row.append(str(val))
            t.write("\t".join(row) + "\n")

        # special metric: FILESIZE_bytes (per-file *source* sizes)
        metric = "FILESIZE_bytes"
        metric_total = sum(file_sizes.get(fid, 0) for fid in kept_file_ids)
        per_pkg_totals[metric] = metric_total
        row = [metric, str(metric_total)]
        for fid in kept_file_ids:
            row.append(str(file_sizes.get(fid, 0)))
        t.write("\t".join(row) + "\n")

        # special metric: PACKAGE_SIZE_BYTES (whole package size)
        metric = "PACKAGE_SIZE_BYTES"
        per_pkg_totals[metric] = package_size_bytes
        row = [metric, str(package_size_bytes)]
        # per-file columns = 0; package size is a package-level property
        for _ in kept_file_ids:
            row.append("0")
        t.write("\t".join(row) + "\n")

    return per_pkg_totals, []  # no extra warnings for now


def main():
    if len(sys.argv) not in (2, 3):
        print("Usage: python3 compile_scores.py <analysis_root> [extracted_root]", file=sys.stderr)
        sys.exit(1)

    analysis_root = os.path.abspath(sys.argv[1])
    extracted_root = os.path.abspath(sys.argv[2]) if len(sys.argv) == 3 else None

    if not os.path.isdir(analysis_root):
        print(f"[ERROR] analysis_root is not a directory: {analysis_root}", file=sys.stderr)
        sys.exit(1)

    # Root-level outputs
    global_table_path = os.path.join(analysis_root, "Consolidated_Package_Scores.tsv")
    global_log_path = os.path.join(analysis_root, "compile_scores_root.log")

    # Gather package dirs
    pkg_entries = [d for d in os.scandir(analysis_root) if d.is_dir()]
    pkg_entries.sort(key=lambda e: e.name)

    if not pkg_entries:
        print(f"[!] No package directories found in {analysis_root}", file=sys.stderr)
        sys.exit(0)

    # Aggregate per-package totals
    pkg_totals: dict[str, dict[str, int]] = {}
    all_metrics_global: set[str] = set()
    pkgs_with_scores = []
    pkgs_without_scores = []

    for entry in pkg_entries:
        pkg_name = entry.name
        pkg_dir = entry.path
        per_pkg_totals, warnings = process_single_package(pkg_dir, extracted_root)
        if not per_pkg_totals:
            pkgs_without_scores.append(pkg_name)
            continue
        pkg_totals[pkg_name] = per_pkg_totals
        pkgs_with_scores.append(pkg_name)
        all_metrics_global.update(per_pkg_totals.keys())

    if not pkg_totals:
        print("[!] No per-package scores found; nothing to consolidate.", file=sys.stderr)
        sys.exit(0)

    # Order metrics and packages for the root-level table
    metrics_order_global = sorted(all_metrics_global, key=metric_sort_key)
    pkg_names_sorted = sorted(pkgs_with_scores)

    # --- write global consolidated package table ---
    with open(global_table_path, "w", encoding="utf-8") as out:
        # header: package | metric1 | metric2 | ...
        header = ["package"] + metrics_order_global
        out.write("\t".join(header) + "\n")
        for pkg in pkg_names_sorted:
            row = [pkg]
            scores = pkg_totals.get(pkg, {})
            for metric in metrics_order_global:
                val = scores.get(metric, 0)
                row.append(str(val))
            out.write("\t".join(row) + "\n")

    # --- write root-level log ---
    with open(global_log_path, "w", encoding="utf-8") as log:
        log.write("=== compile_scores_root.log ===\n")
        log.write(f"analysis_root={analysis_root}\n")
        if extracted_root is not None:
            log.write(f"extracted_root={extracted_root}\n")
        log.write(f"packages_with_scores={len(pkgs_with_scores)}\n")
        log.write(f"packages_without_scores={len(pkgs_without_scores)}\n")
        log.write(f"metrics_observed={','.join(metrics_order_global)}\n\n")
        if pkgs_without_scores:
            log.write("Packages with no usable *_score_*.txt metrics:\n")
            for name in sorted(pkgs_without_scores):
                log.write(f"  - {name}\n")
        else:
            log.write("All package directories had at least one *_score_*.txt file.\n")

    print("[+] Per-package consolidated_scores.tsv written inside each package directory.")
    print(f"[+] Global per-package table written to: {global_table_path}")
    print(f"[+] Root log written to: {global_log_path}")


if __name__ == "__main__":
    main()


