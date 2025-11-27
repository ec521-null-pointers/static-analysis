#!/usr/bin/env bash

set -e

REPO="DataDog/malicious-software-packages-dataset"
BRANCH="main"
BASE_PATH="samples/npm/compromised_lib"
OUTPUT_DIR="./recent_compromised_libs"
DAYS=5

mkdir -p "$OUTPUT_DIR"

echo "[+] Fetching folder list from GitHub…"

DIRS=$(curl -s \
  "https://api.github.com/repos/$REPO/contents/$BASE_PATH" \
  | jq -r '.[] | select(.type=="dir") | .name')

NOW=$(date +%s)

download_recursive() {
    local path="$1"
    local dest="$2"

    mkdir -p "$dest"

    ITEMS=$(curl -s \
      "https://api.github.com/repos/$REPO/contents/$path?ref=$BRANCH")

    echo "$ITEMS" | jq -c '.[]' | while read ITEM; do
        TYPE=$(echo "$ITEM" | jq -r '.type')
        NAME=$(echo "$ITEM" | jq -r '.name')

        if [ "$TYPE" == "file" ]; then
            URL=$(echo "$ITEM" | jq -r '.download_url')
            echo "      downloading file: $path/$NAME"
            curl -s -L "$URL" -o "$dest/$NAME"
        elif [ "$TYPE" == "dir" ]; then
            echo "      entering subfolder: $path/$NAME"
            download_recursive "$path/$NAME" "$dest/$NAME"
        fi
    done
}

for FOLDER in $DIRS; do
    echo "----------------------------------------------------"
    echo "[+] Checking folder: $FOLDER"

    COMMIT_JSON=$(curl -s \
      "https://api.github.com/repos/$REPO/commits?path=$BASE_PATH/$FOLDER&per_page=1")

    LAST_DATE=$(echo "$COMMIT_JSON" | jq -r '.[0].commit.committer.date')

    if [ "$LAST_DATE" = "null" ] || [ -z "$LAST_DATE" ]; then
        echo "    [-] No commit info, skipping"
        continue
    fi

    LAST_TS=$(date -d "$LAST_DATE" +%s)
    AGE_DAYS=$(( (NOW - LAST_TS) / 86400 ))

    echo "    Last modified: $LAST_DATE ($AGE_DAYS days ago)"

    if [ $AGE_DAYS -le $DAYS ]; then
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


