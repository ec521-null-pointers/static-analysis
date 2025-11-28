#!/usr/bin/env python3
"""
batch_analysis.py

Usage:
    python3 batch_analysis.py npm_top_10k/extracted

This script:
  1. Iterates through every subdirectory (package) inside <extracted_root>
     and runs extract_features.py to populate:
         <parent>/Analysis/<pkgname>/
  2. Runs compile_scores.py on <parent>/Analysis (and passes <extracted_root>)
     to produce a consolidated per-package score TSV, with PACKAGE_SIZE_BYTES
     computed from the real extracted packages when possible.
  3. Runs generate_package_features.py on that TSV to produce an ML-ready
     features CSV.
  4. Runs generate_scan_results.py on the features CSV, using the trained
     model found in:
         Analysis Codes/classification_configuration/
     to classify each package as LOW / MEDIUM / HIGH risk.

Outputs:
  - Per-package Analysis/<pkg>/...
  - Consolidated TSV (from compile_scores.py) in Analysis/
  - Features CSV (from generate_package_features.py) in Analysis/
  - <features_basename>_analysis.csv (from generate_scan_results.py) in Analysis/
"""

import os
import sys
import subprocess


def log(msg: str) -> None:
    print(msg, flush=True)


def find_single_tsv(analysis_root: str) -> str:
    """
    Look for exactly one .tsv file directly under analysis_root.
    Return its path, or "" if not found / ambiguous.
    """
    candidates = [
        os.path.join(analysis_root, f)
        for f in os.listdir(analysis_root)
        if f.lower().endswith(".tsv")
    ]
    if len(candidates) == 1:
        return candidates[0]
    if len(candidates) == 0:
        log("[!] No .tsv file found in Analysis/; cannot build ML features.")
    else:
        log("[!] Multiple .tsv files found in Analysis/; please clean up or "
            "adapt batch_analysis.py to select the right one.")
        for c in candidates:
            log(f"    - {c}")
    return ""


def main():
    if len(sys.argv) != 2:
        print("Usage: python3 batch_analysis.py <extracted_root>")
        sys.exit(1)

    extracted_root = os.path.abspath(sys.argv[1])
    if not os.path.isdir(extracted_root):
        print(f"[!] Error: Not a directory: {extracted_root}")
        sys.exit(1)

    # Parent of extracted_root, where Analysis/ will live
    parent = os.path.dirname(extracted_root)
    analysis_root = os.path.join(parent, "Analysis")
    os.makedirs(analysis_root, exist_ok=True)

    # Location of scripts (inside "Analysis Codes")
    repo_root = os.path.dirname(os.path.abspath(__file__))
    analysis_codes_dir = os.path.join(repo_root, "Analysis Codes")

    extract_script = os.path.join(analysis_codes_dir, "extract_features.py")
    if not os.path.isfile(extract_script):
        print(f"[!] extract_features.py not found at:\n    {extract_script}")
        sys.exit(1)

    compile_script = os.path.join(analysis_codes_dir, "compile_scores.py")
    if not os.path.isfile(compile_script):
        log(f"[!] Warning: compile_scores.py not found at:\n    {compile_script}")
        log("    Batch per-package analysis will still run, "
            "but scores will not be consolidated.")

    # New scripts for ML features & classification
    gen_features_script = os.path.join(
        analysis_codes_dir, "generate_package_features.py"
    )
    scan_results_script = os.path.join(
        analysis_codes_dir, "generate_scan_results.py"
    )
    model_dir = os.path.join(analysis_codes_dir, "classification_configuration")

    # Packages under extracted_root
    packages = [d for d in os.scandir(extracted_root) if d.is_dir()]
    packages.sort(key=lambda e: e.name)
    total = len(packages)

    log(f"[+] Found {total} packages in {extracted_root}")

    done = 0
    failed = 0
    skipped = 0

    for idx, pkg in enumerate(packages, start=1):
        pkg_name = pkg.name
        pkg_dir = pkg.path

        # This is where extract_features.py will write:
        #   <parent>/Analysis/<pkg_name>/
        per_pkg_analysis = os.path.join(analysis_root, pkg_name)

        # Resume-friendly: skip if per-package Analysis dir already has content
        if os.path.isdir(per_pkg_analysis) and os.listdir(per_pkg_analysis):
            log(f"[{idx}/{total}] {pkg_name}: already analyzed (skipping).")
            skipped += 1
            continue

        log(f"[{idx}/{total}] {pkg_name}: starting analysis")
        log(f"    package dir : {pkg_dir}")
        log(f"    analysis dir (expected): {per_pkg_analysis}")

        try:
            # IMPORTANT: cwd is the parent directory, NOT per-package Analysis
            subprocess.run(
                ["python3", extract_script, pkg_dir],
                cwd=parent,
                check=True,
            )
            done += 1
            log("    [+] completed.")
        except subprocess.CalledProcessError as e:
            failed += 1
            log(f"    [!] FAILED (exit {e.returncode})")
        except Exception as e:
            failed += 1
            log(f"    [!] Unexpected error: {e}")

    log("\n=== Batch Completed ===")
    log(f"Processed: {done}")
    log(f"Skipped:   {skipped}")
    log(f"Failed:    {failed}")
    log(f"Output:    {analysis_root}")

    # ------------------------------------------------------------------
    # 2. Run compile_scores.py to aggregate all per-package Scores
    # ------------------------------------------------------------------
    results_tsv = ""
    if os.path.isfile(compile_script):
        log("\n[+] Running compile_scores.py to consolidate scores...")
        try:
            # NOTE: pass both analysis_root and extracted_root so that
            #       PACKAGE_SIZE_BYTES can be computed from the real packages.
            subprocess.run(
                ["python3", compile_script, analysis_root, extracted_root],
                check=True,
            )
            log("[+] compile_scores.py completed successfully.")
            # Try to locate the consolidated TSV
            results_tsv = find_single_tsv(analysis_root)
        except subprocess.CalledProcessError as e:
            log(f"[!] compile_scores.py FAILED (exit {e.returncode}).")
        except Exception as e:
            log(f"[!] Unexpected error while running compile_scores.py: {e}")
    else:
        log("\n[!] Skipping score consolidation (compile_scores.py not found).")

    # ------------------------------------------------------------------
    # 3. Build ML features via generate_package_features.py
    # ------------------------------------------------------------------
    features_csv = ""
    if results_tsv and os.path.isfile(gen_features_script):
        features_csv = os.path.join(
            analysis_root, "ml_features.csv"
        )
        log(f"\n[+] Building ML features from TSV:")
        log(f"    Input TSV : {results_tsv}")
        log(f"    Output CSV: {features_csv}")
        try:
            subprocess.run(
                [
                    "python3",
                    gen_features_script,
                    results_tsv,
                    features_csv,
                    "--fill-missing",
                ],
                check=True,
            )
            log("[+] generate_package_features.py completed successfully.")
        except subprocess.CalledProcessError as e:
            log(f"[!] generate_package_features.py FAILED (exit {e.returncode}).")
            features_csv = ""
        except Exception as e:
            log(f"[!] Unexpected error while running generate_package_features.py: {e}")
            features_csv = ""
    elif results_tsv and not os.path.isfile(gen_features_script):
        log(f"\n[!] generate_package_features.py not found at:\n    {gen_features_script}")

    # If no results_tsv, features step is skipped automatically.

    # ------------------------------------------------------------------
    # 4. Run generate_scan_results.py to classify packages
    # ------------------------------------------------------------------
    if features_csv and os.path.isfile(scan_results_script):
        if not os.path.isdir(model_dir):
            log(f"\n[!] Model directory not found: {model_dir}")
        else:
            log("\n[+] Running generate_scan_results.py to classify packages...")
            log(f"    Features CSV: {features_csv}")
            log(f"    Model dir   : {model_dir}")
            try:
                output_csv = os.path.join(analysis_root,"batch_analysis_result.csv")
                subprocess.run(
                    [
                        "python3",
                        scan_results_script,
                        "--features",
                        features_csv,
                        "--model-dir",
                        model_dir,
                        "--output",
                        output_csv,
                    ],
                    check=True,
                )
                log(f"[+] Saved final batch result CSV to: {output_csv}.")
                log("[+] generate_scan_results.py completed successfully.")
            except subprocess.CalledProcessError as e:
                log(f"[!] generate_scan_results.py FAILED (exit {e.returncode}).")
            except Exception as e:
                log(f"[!] Unexpected error while running generate_scan_results.py: {e}")
    elif features_csv and not os.path.isfile(scan_results_script):
        log(f"\n[!] generate_scan_results.py not found at:\n    {scan_results_script}")
    else:
        if not features_csv:
            log("\n[!] Skipping classification step (no features CSV).")

    log("\n[+] Full pipeline finished.")


if __name__ == "__main__":
    main()


