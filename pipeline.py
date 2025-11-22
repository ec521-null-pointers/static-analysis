#!/usr/bin/env python3
import subprocess

# 0. Download all tgz files
subprocess.check_call(["python3", "download_tgz.py", "top_10k_names.txt"])

# 1. Extract all .tgz packages (no arguments)
subprocess.check_call(["python3", "extract_tgz.py"])

# 2. Run batch analysis (needs 1 argument: extracted folder)
subprocess.check_call(["python3", "batch_analysis.py", "npm_top_10k/extracted"])

# 3. Compile total package-level scores (needs 1 argument: Analysis folder)
subprocess.check_call(["python3", "compile_scores.py", "npm_top_10k/Analysis"])
