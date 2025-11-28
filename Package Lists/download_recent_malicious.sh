#!/usr/bin/env bash
set -euo pipefail

REPO="DataDog/malicious-software-packages-dataset"
BRANCH="main"
BASE_PATH="samples/npm/compromised_lib"
OUTPUT_DIR="./recent_compromised_libs"
DAYS=5

mkdir -p "$OUTPUT_DIR"

# Optional auth header (only if GITHUB_TOKEN is set)
AUTH=()
if [ -n "${GITHUB_TOKEN:-}" ]; then
    AUTH=(-H "Authorization: Bearer $GITHUB_TOKEN")
    echo "[+] Using GitHub token (higher rate limit)."
else
    echo "[!] No GITHUB_TOKEN set – limited to 60 requests/hour."
fi

echo "[+] Fetching folder list from GitHub…"

TOP_JSON=$(curl -s "${AUTH[@]}" \
  "https://api.github.com/repos/$REPO/contents/$BASE_PATH?ref=$BRANCH")

if ! echo "$TOP_JSON" | jq -e 'type == "array"' >/dev/null; then
    echo "[!] Unexpected response from GitHub when listing $BASE_PATH"
    echo "$TOP_JSON" | jq -r '.message // .'
    exit 1
fi

DIRS=$(echo "$TOP_JSON" | jq -r '.[] | select(.type=="dir") | .name')

NOW=$(date +%s)

download_recursive() {
    local path="$1"
    local dest="$2"

    mkdir -p "$dest"

    local ITEMS_JSON
    ITEMS_JSON=$(curl -s "${AUTH[@]}" \
      "https://api.github.com/repos/$REPO/contents/$path?ref=$BRANCH")

    if ! echo "$ITEMS_JSON" | jq -e 'type == "array"' >/dev/null; then
        echo "      [!] Unexpected response for $path, skipping"
        echo "$ITEMS_JSON" | jq -r '.message // empty'
        return
    fi

    echo "$ITEMS_JSON" | jq -c '.[]' | while read -r ITEM; do
        local TYPE NAME URL
        TYPE=$(echo "$ITEM" | jq -r '.type // empty')
        NAME=$(echo "$ITEM" | jq -r '.name // empty')

        if [ -z "$TYPE" ]; then
            echo "      [-] Skipping invalid item"
            continue
        fi

        if [ "$TYPE" = "file" ]; then
            URL=$(echo "$ITEM" | jq -r '.download_url')
            echo "      downloading file: $path/$NAME"
            curl -s -L "${AUTH[@]}" "$URL" -o "$dest/$NAME"
        elif [ "$TYPE" = "dir" ]; then
            echo "      entering subfolder: $path/$NAME"
            download_recursive "$path/$NAME" "$dest/$NAME"
        fi
    done
}

for FOLDER in $DIRS; do
    echo "----------------------------------------------------"
    echo "[+] Checking folder: $FOLDER"

    COMMIT_JSON=$(curl -s "${AUTH[@]}" \
      "https://api.github.com/repos/$REPO/commits?path=$BASE_PATH/$FOLDER&per_page=1")

    LAST_DATE=$(echo "$COMMIT_JSON" | jq -r '.[0].commit.committer.date // empty')

    if [ -z "$LAST_DATE" ]; then
        echo "    [-] No commit info, skipping"
        continue
    fi

    LAST_TS=$(date -d "$LAST_DATE" +%s)
    AGE_DAYS=$(( (NOW - LAST_TS) / 86400 ))

    echo "    Last modified: $LAST_DATE ($AGE_DAYS days ago)"

    if [ "$AGE_DAYS" -le "$DAYS" ]; then
        echo "    [+] NEW (≤$DAYS days) — downloading"
        DEST="$OUTPUT_DIR/$FOLDER"
        download_recursive "$BASE_PATH/$FOLDER" "$DEST"
        echo "    [+] Saved to $DEST"
    else
        echo "    [-] Too old (> $DAYS days), skipping"
    fi
done

echo "----------------------------------------------------"
echo "[+] Completed. Recent packages in: $OUTPUT_DIR/"


