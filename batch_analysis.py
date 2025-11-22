#!/usr/bin/env python3
"""
batch_analysis.py

Usage:
    python3 batch_analysis.py npm_top_10k/extracted

This script:
    - Iterates through every subdirectory (package) inside the extracted directory
    - Creates npm_top_10k/Analysis/<pkgname>/
    - Runs extract_features.py with:
            python3 extract_features.py <pkg_dir>
      with cwd = <analysis_pkg_dir>
    - All static_features, C1, C2, D1, scores, etc. will be created
      inside the per-package analysis directory
"""

import os
import sys
import subprocess


def log(msg):
    print(msg, flush=True)


def main():
    if len(sys.argv) != 2:
        print("Usage: python3 batch_analysis.py <extracted_root>")
        sys.exit(1)

    extracted_root = os.path.abspath(sys.argv[1])

    if not os.path.isdir(extracted_root):
        print(f"[!] Error: Not a directory: {extracted_root}")
        sys.exit(1)

    # Analysis directory: sibling of extracted
    parent = os.path.dirname(extracted_root)
    analysis_root = os.path.join(parent, "Analysis")
    os.makedirs(analysis_root, exist_ok=True)

    # Location of extract_features.py (inside "Analysis Codes")
    repo_root = os.path.dirname(os.path.abspath(__file__))
    extract_script = os.path.join(repo_root, "Analysis Codes", "extract_features.py")

    if not os.path.isfile(extract_script):
        print(f"[!] extract_features.py not found at:\n    {extract_script}")
        sys.exit(1)

    # Packages under extracted_root
    packages = [
        d for d in os.scandir(extracted_root) if d.is_dir()
    ]
    packages.sort(key=lambda e: e.name)

    total = len(packages)
    log(f"[+] Found {total} packages in {extracted_root}")

    done = 0
    failed = 0
    skipped = 0

    for idx, pkg in enumerate(packages, start=1):
        pkg_name = pkg.name
        pkg_dir = pkg.path

        out_dir = os.path.join(analysis_root, pkg_name)
        os.makedirs(out_dir, exist_ok=True)

        # Resume-friendly: skip if output contains files
        if os.listdir(out_dir):
            log(f"[{idx}/{total}] {pkg_name}: already analyzed (skipping).")
            skipped += 1
            continue

        log(f"[{idx}/{total}] {pkg_name}: starting analysis")
        log(f"    package dir : {pkg_dir}")
        log(f"    analysis dir: {out_dir}")

        try:
            subprocess.run(
                ["python3", extract_script, pkg_dir],
                cwd=out_dir,
                check=True
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


if __name__ == "__main__":
    main()


