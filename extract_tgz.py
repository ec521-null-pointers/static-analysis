#!/usr/bin/env python3
import os
import sys
import tarfile

def log(m): 
    print(m, flush=True)

def safe_extract(tar, path="."):
    """Prevent path traversal attacks."""
    abs_dest = os.path.abspath(path)
    for member in tar.getmembers():
        dest = os.path.abspath(os.path.join(path, member.name))
        if not dest.startswith(abs_dest):
            raise Exception(f"Unsafe tar path detected: {member.name}")
    tar.extractall(path)

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 extract_tgz.py <BASE_DIR>")
        print("Example: python3 extract_tgz.py npm_top_10k")
        sys.exit(1)

    BASE = sys.argv[1]
    BASE = BASE.rstrip("/")

    TARBALL_DIR = os.path.join(BASE, "tarballs")
    EXTRACT_DIR = os.path.join(BASE, "extracted")

    if not os.path.isdir(TARBALL_DIR):
        log(f"[!] No tarballs found in {TARBALL_DIR}")
        sys.exit(1)

    os.makedirs(EXTRACT_DIR, exist_ok=True)

    files = sorted(
        f for f in os.listdir(TARBALL_DIR)
        if f.endswith(".tgz")
    )
    log(f"[+] Found {len(files)} tarballs in {TARBALL_DIR}")

    for idx, fname in enumerate(files, start=1):
        base = fname[:-4]  # remove .tgz
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


