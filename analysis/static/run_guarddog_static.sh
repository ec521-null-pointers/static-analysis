#!/usr/bin/env bash
# Static-only GuardDog runner for npm packages
# Usage:
#   analysis/static/run_guarddog_static.sh <target> [<target> ...]
#   analysis/static/run_guarddog_static.sh -f samples/packages.txt
# Targets can be:
#   - npm name (e.g., lodash)
#   - npm name@version (e.g., tinycolor2@1.6.0)
#   - path to .tgz (npm pack output)
#   - path to unpacked directory (e.g., samples/foo/package)

set -euo pipefail

if ! command -v guarddog >/dev/null 2>&1; then
  echo "[-] guarddog not found. Activate your venv and 'pipx install guarddog' or 'pip install guarddog'." >&2
  exit 1
fi

# Static (source code) rules only — from GuardDog README (npm → Source code heuristics)
STATIC_RULES=(
  npm-serialize-environment
  npm-obfuscation
  npm-silent-process-execution
  shady-links
  npm-exec-base64
  npm-install-script
  npm-steganography
  npm-dll-hijacking
  npm-exfiltrate-sensitive-data
)

rules_flags=()
for r in "${STATIC_RULES[@]}"; do
  rules_flags+=(--rules "$r")
done

sanitize() {
  # turn things like "foo@1.2.3" or "path/to.tgz" into a safe folder name
  echo "$1" | tr '/ @' '___'
}

scan_one() {
  local target="$1"
  local outdir="out/$(sanitize "$target")"
  mkdir -p "$outdir"

  # If it's "name@ver", split so we can pass --version cleanly
  local name="$target"
  local version=""
  if [[ "$target" != */* && "$target" == *@* ]]; then
    name="${target%@*}"
    version="${target##*@}"
  fi

  echo "[+] Scanning: $target"
  if [[ -d "$target" || -f "$target" ]]; then
    # Local dir or .tgz → scan directly
    guarddog npm scan "$target" \
      --output-format json \
      "${rules_flags[@]}" \
      > "$outdir/guarddog_static.json"
  else
    # Remote npm name[/@version]
    if [[ -n "$version" ]]; then
      guarddog npm scan "$name" --version "$version" \
        --output-format json \
        "${rules_flags[@]}" \
        > "$outdir/guarddog_static.json"
    else
      guarddog npm scan "$name" \
        --output-format json \
        "${rules_flags[@]}" \
        > "$outdir/guarddog_static.json"
    fi
  fi

  echo "[✓] Wrote $outdir/guarddog_static.json"
}

if [[ $# -eq 0 ]]; then
  echo "Usage: $0 <target> [<target> ...] | -f <file_with_targets>" >&2
  exit 1
fi

if [[ "$1" == "-f" ]]; then
  [[ -f "$2" ]] || { echo "[-] file not found: $2" >&2; exit 1; }
  while IFS= read -r line; do
    [[ -z "$line" || "$line" =~ ^# ]] && continue
    scan_one "$line"
  done < "$2"
else
  for t in "$@"; do scan_one "$t"; done
fi
BASH

chmod +x analysis/static/run_guarddog_static.sh
