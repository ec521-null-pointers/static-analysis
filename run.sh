#!/usr/bin/env bash

# Usage:
#   run.sh [-p PACKAGE_LIST_FILENAME] [-o OUT_DIR] [--skip-audit] [--skip-eslint] [--strict] [-h]
#
set -euo pipefail
IFS=$'\n\t'

# Defaults
PACKAGE_LIST_FILENAME="${PACKAGE_LIST_FILENAME:-.}"
OUT_DIR="${OUT_DIR:-./reports}"

progname="$(basename "$0")"

usage() {
    cat <<EOF
Usage: $progname [options]

Options:
    -f, --file          Path to a single package.json file to analyze 
    -o, --out DIR         Output directory for reports (default: $OUT_DIR)
    -h, --help            Show this help
EOF
    exit 1
}

# Parse args (simple)
while [[ $# -gt 0 ]]; do
    case "$1" in
        -f|--file) PACKAGE_LIST_FILENAME="$2"; shift 2 ;;
        -o|--out) OUT_DIR="$2"; shift 2 ;;
        -h|--help) usage ;;
        --) shift; break ;;
        *) echo "Unknown arg: $1"; usage ;;
    esac
done

timestamp() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }

echo "[$(timestamp)] Starting static analysis"
echo "  Package list filename : $PACKAGE_LIST_FILENAME"
echo "  out dir: $OUT_DIR"
mkdir -p "$OUT_DIR"

# Helpers
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

safe_run() {
    # run command, don't fail the whole script (errors handled by strict flag)
    if ! "$@"; then
        echo "[$(timestamp)] Command failed: $*"
        return 1
    fi
    return 0
}


python3 download_tgz.py "$PACKAGE_LIST_FILENAME" $OUT_DIR
python3 extract_tgzs.py $OUT_DIR
python3 batch_analysis.py $OUT_DIR/extracted

exit 0