#!/usr/bin/env bash
set -e

# ---------------------------------------------------------
# Usage:
#   ./extract_recursive_zips.sh <parent_directory>
#
# Example:
#   ./extract_recursive_zips.sh /storage/Project/npm_static/malicious_package/malicious_intent
#
# Output directory will be:
#   /storage/Project/npm_static/malicious_package/malicious_intent_extracted
#
# Every zip found gets extracted into:
#   malicious_intent_extracted/<zipfilename>/
# ---------------------------------------------------------

if [ $# -ne 1 ]; then
    echo "Usage: $0 <parent_directory>"
    exit 1
fi

INPUT_ROOT="$1"
OUTPUT_ROOT="${INPUT_ROOT}_extracted"

echo "[+] Input directory:  $INPUT_ROOT"
echo "[+] Output directory: $OUTPUT_ROOT"
echo

mkdir -p "$OUTPUT_ROOT"

# Export OUTPUT_ROOT so it's available inside the -exec shell
export OUTPUT_ROOT

find "$INPUT_ROOT" -type f -name "*.zip" -exec sh -c '
    for z; do
        base=$(basename "$z")
        name="${base%.zip}"

        out="$OUTPUT_ROOT/$name"
        echo "[*] Extracting: $z"
        echo "    -> $out"
        mkdir -p "$out"

        unzip -P infected -q "$z" -d "$out"
    done
' sh {} +

echo
echo "[+] Extraction complete."
echo "[+] All files extracted into: $OUTPUT_ROOT"


