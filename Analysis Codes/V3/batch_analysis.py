#!/usr/bin/env python3
import sys
import os
import time
import requests

REGISTRY_URL = "https://registry.npmjs.org"

BASE = "npm_top_10k"
DOWNLOAD_DIR = os.path.join(BASE, "tarballs")

def log(m): print(m, flush=True)

def safe_pkg_filename(name: str, version: str) -> str:
    """
    Turn an npm package name + version into a safe single filename.

    Examples:
      @types/draft-js, 0.11.20  -> types__draft-js-0.11.20.tgz
      react, 18.3.1             -> react-18.3.1.tgz
    """
    # drop leading @, replace remaining / with __
    base = name.lstrip("@").replace("/", "__")
    return f"{base}-{version}.tgz"

def fetch_metadata(pkg_name, retries=3, delay=1):
    url = f"{REGISTRY_URL}/{pkg_name}"
    for attempt in range(1, retries + 1):
        try:
            r = requests.get(url, timeout=15)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            log(f"  [-] metadata error for {pkg_name} ({attempt}/{retries}): {e}")
            time.sleep(delay)
    return None

def download_tarball(name, version, url, retries=3, delay=1):
    os.makedirs(DOWNLOAD_DIR, exist_ok=True)

    filename = safe_pkg_filename(name, version)
    out_path = os.path.join(DOWNLOAD_DIR, filename)

    if os.path.exists(out_path):
        log(f"  [=] {name}@{version} already downloaded, skipping.")
        return True

    for attempt in range(1, retries + 1):
        try:
            log(f"  [>] downloading {name}@{version} -> {filename}")
            with requests.get(url, stream=True, timeout=30) as r:
                r.raise_for_status()
                with open(out_path, "wb") as f:
                    for chunk in r.iter_content(8192):
                        if chunk:
                            f.write(chunk)
            log(f"  [+] saved to {out_path}")
            return True
        except Exception as e:
            log(f"  [-] download error for {name}@{version} ({attempt}/{retries}): {e}")
            time.sleep(delay)

    log(f"  [!] giving up on {name}@{version}")
    return False

def process_list(list_path):
    if not os.path.exists(list_path):
        log(f"[!] input file not found: {list_path}")
        sys.exit(1)

    with open(list_path, "r", encoding="utf-8") as f:
        names = [line.strip() for line in f if line.strip() and not line.startswith("#")]

    log(f"[+] loaded {len(names)} package names from {list_path}")
    success = 0
    fail = 0

    for idx, name in enumerate(names, start=1):
        log(f"\n[{idx}/{len(names)}] {name}")
        meta = fetch_metadata(name)
        if not meta:
            fail += 1
            continue

        latest = meta.get("dist-tags", {}).get("latest")
        if not latest:
            log(f"  [!] no 'latest' dist-tag for {name}, skipping.")
            fail += 1
            continue

        vinfo = meta.get("versions", {}).get(latest)
        if not vinfo:
            log(f"  [!] no version info for {name}@{latest}, skipping.")
            fail += 1
            continue

        tarball_url = vinfo.get("dist", {}).get("tarball")
        if not tarball_url:
            log(f"  [!] no tarball URL for {name}@{latest}, skipping.")
            fail += 1
            continue

        if download_tarball(name, latest, tarball_url):
            success += 1
        else:
            fail += 1

    log(f"\n[+] done. success={success}, failed={fail}")

def main():
    if len(sys.argv) != 2:
        print("Usage: python3 download_tgz.py TOP_10k_names.txt")
        sys.exit(1)
    process_list(sys.argv[1])

if __name__ == "__main__":
    main()


