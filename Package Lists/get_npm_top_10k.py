#!/usr/bin/env python3
import requests
import time

PAGE_SIZE = 250
TOTAL = 10000
PAGES = TOTAL // PAGE_SIZE

OUTFILE = "top_10k_names.txt"

def fetch_page(offset):
    # IMPORTANT: text=.  (dot)
    url = f"https://registry.npmjs.org/-/v1/search?text=js&size={PAGE_SIZE}&from={offset}"
    print("Fetching:", url)
    r = requests.get(url, timeout=20)
    r.raise_for_status()     # if any issue → error stops here
    return r.json().get("objects", [])

all_pkgs = []

for i in range(PAGES):
    offset = i * PAGE_SIZE
    objs = fetch_page(offset)
    
    # extract names
    for obj in objs:
        all_pkgs.append(obj["package"]["name"])

    time.sleep(0.5)   # avoid throttling

with open(OUTFILE, "w") as f:
    for name in all_pkgs:
        f.write(name + "\n")

print(f"Saved {len(all_pkgs)} package names → {OUTFILE}")


