#!/usr/bin/env python3
import sys
import os
import time
import random
import requests

BASE_SEARCH_URL = "https://registry.npmjs.org/-/v1/search"

# How many *new* packages you want
TARGET_NEW = 500

# Max results per query (API allows up to 250)
PAGE_SIZE = 250

# A pool of different queries/prefixes to get diverse packages.
# You can add/remove terms here.
QUERY_POOL = [
    "react", "vue", "angular", "eslint", "webpack", "rollup",
    "cli", "server", "express", "api", "plugin", "tool",
    "node", "typescript", "ts", "js", "lib", "util",
] + list("abcdefghijklmnopqrstuvwxyz0123456789")  # single-char prefixes


def log(msg: str):
    print(msg, flush=True)


def load_exclusions(path: str):
    if not os.path.exists(path):
        log(f"[!] Exclusion file not found: {path}")
        return set()
    with open(path, "r", encoding="utf-8") as f:
        names = {line.strip() for line in f if line.strip()}
    log(f"[+] Loaded {len(names)} excluded package names from {path}")
    return names


def fetch_search(query: str, size: int = PAGE_SIZE, offset: int = 0):
    params = {
        "text": query,
        "size": size,
        "from": offset,
    }
    url = BASE_SEARCH_URL
    log(f"Fetching: {url}?text={query}&size={size}&from={offset}")
    r = requests.get(url, params=params, timeout=20)
    r.raise_for_status()
    data = r.json()
    return data.get("objects", [])


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 get_npm_rand_500_alt.py top_10k_names.txt [output_names.txt]")
        sys.exit(1)

    exclude_path = sys.argv[1]
    out_path = sys.argv[2] if len(sys.argv) >= 3 else "npm_rand_500.txt"

    excluded = load_exclusions(exclude_path)
    chosen = []          # ordered list
    chosen_set = set()   # for fast lookup

    # Shuffle query pool so each run hits different patterns first
    queries = QUERY_POOL[:]
    random.shuffle(queries)

    # We’ll loop over queries repeatedly until we have TARGET_NEW
    query_index = 0
    attempts = 0
    max_attempts = 1000  # safety guard so we don't loop forever if something breaks

    while len(chosen) < TARGET_NEW and attempts < max_attempts:
        q = queries[query_index]
        query_index = (query_index + 1) % len(queries)
        attempts += 1

        try:
            objs = fetch_search(q)
        except Exception as e:
            log(f"[!] Error fetching for query '{q}': {e}")
            time.sleep(1.0)
            continue

        if not objs:
            log(f"[!] No results for query '{q}'")
            time.sleep(0.5)
            continue

        new_this_query = 0
        for obj in objs:
            name = obj.get("package", {}).get("name")
            if not name:
                continue
            if name in excluded or name in chosen_set:
                continue
            chosen.append(name)
            chosen_set.add(name)
            new_this_query += 1

            if len(chosen) >= TARGET_NEW:
                break

        log(f"[+] Query '{q}' contributed {new_this_query} new packages "
            f"(total so far: {len(chosen)}/{TARGET_NEW})")

        # be polite to the registry
        time.sleep(0.5)

    log(f"[+] Collected {len(chosen)} new package names (excluding top_10k)")

    with open(out_path, "w", encoding="utf-8") as f:
        for name in chosen:
            f.write(name + "\n")

    log(f"[+] Saved package list to {out_path}")


if __name__ == "__main__":
    main()


