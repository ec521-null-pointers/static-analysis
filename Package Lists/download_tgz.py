#!/usr/bin/env python3
import sys
import os
import time
import requests

REGISTRY_URL = "https://registry.npmjs.org"

def log(m):
    print(m, flush=True)


def safe_pkg_filename(name: str, version: str) -> str:
    """
    Convert npm package name and version into a safe tgz filename.
    Examples:
      @types/draft-js -> types__draft-js-0.11.20.tgz
      react -> react-18.3.1.tgz
    """
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


def download_tarball(name, version, url, out_dir, retries=3, delay=1):
    os.makedirs(out_dir, exist_ok=True)
    filename = safe_pkg_filename(name, version)
    out_path = os.path.join(out_dir, filename)

    if os.path.exists(out_path):
        log(f"  [=] {name}@{version} already exists, skipping.")
        return True

    for attempt in range(1, retries + 1):
        try:
            log(f"  [>] downloading {name}@{version} → {filename}")
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


def process_list(list_path, output_base_dir):
    if not os.path.exists(list_path):
        log(f"[!] input file not found: {list_path}")
        sys.exit(1)

    tarball_dir = os.path.join(output_base_dir, "tarballs")
    os.makedirs(tarball_dir, exist_ok=True)

    with open(list_path, "r", encoding="utf-8") as f:
        names = [line.strip() for line in f if line.strip() and not line.startswith("#")]

    log(f"[+] loaded {len(names)} package names from {list_path}")
    log(f"[+] saving tarballs into: {tarball_dir}")

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
            log(f"  [!] no 'latest' dist-tag, skipping.")
            fail += 1
            continue

        vinfo = meta.get("versions", {}).get(latest)
        if not vinfo:
            log(f"  [!] no version info for {name}@{latest}, skipping.")
            fail += 1
            continue

        tarball_url = vinfo.get("dist", {}).get("tarball")
        if not tarball_url:
            log(f"  [!] no tarball URL, skipping.")
            fail += 1
            continue

        if download_tarball(name, latest, tarball_url, tarball_dir):
            success += 1
        else:
            fail += 1

    log(f"\n[+] done. success={success}, failed={fail}")


def main():
    if len(sys.argv) < 2 or len(sys.argv) > 3:
        print("Usage:")
        print("  python3 download_tgz.py <names_list.txt> [output_directory]")
        print("")
        print("Examples:")
        print("  python3 download_tgz.py top_1k.txt")
        print("  python3 download_tgz.py top_1k.txt /storage/Project/npm_static/npm_1k_recent")
        sys.exit(1)

    list_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) == 3 else "npm_top_10k"

    process_list(list_path, output_dir)


if __name__ == "__main__":
    main()


