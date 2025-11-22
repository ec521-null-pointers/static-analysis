#!/usr/bin/env python3
import os
import sys
import tarfile

BASE = "npm_top_10k"
TARBALL_DIR = os.path.join(BASE, "tarballs")
EXTRACT_DIR = os.path.join(BASE, "extracted")

def log(m): print(m, flush=True)

def safe_extract(tar, path="."):
    for member in tar.getmembers():
        dest = os.path.abspath(os.path.join(path, member.name))
        if not dest.startswith(os.path.abspath(path)):
            raise Exception("Unsafe tar path")
    tar.extractall(path)

def main():
    if not os.path.isdir(TARBALL_DIR):
        log(f"[!] No tarballs found in {TARBALL_DIR}")
        sys.exit(1)

    os.makedirs(EXTRACT_DIR, exist_ok=True)
    files = sorted(f for f in os.listdir(TARBALL_DIR) if f.endswith(".tgz"))

    log(f"[+] Found {len(files)} tarballs")

    for idx, fname in enumerate(files, start=1):
        base = fname[:-4]   # remove .tgz
        src_path = os.path.join(TARBALL_DIR, fname)
        dest_dir = os.path.join(EXTRACT_DIR, base)

        log(f"\n[{idx}/{len(files)}] Extracting {fname}")

        if os.path.isdir(dest_dir) and os.listdir(dest_dir):
            log("  [=] already extracted, skip")
            continue

        os.makedirs(dest_dir, exist_ok=True)

        try:
            with tarfile.open(src_path, "r:gz") as tar:
                safe_extract(tar, dest_dir)
            log("  [+] done.")
        except Exception as e:
            log(f"  [!] extraction failed: {e}")

if __name__ == "__main__":
    main()


