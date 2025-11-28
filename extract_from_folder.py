#!/usr/bin/env python3
import os
import sys
import tarfile
import zipfile

def log(msg):
    print(msg, flush=True)

def safe_extract_tar(tar, path="."):
    """Safe extraction to avoid path traversal."""
    base_path = os.path.abspath(path)
    for member in tar.getmembers():
        dest = os.path.abspath(os.path.join(path, member.name))
        if not dest.startswith(base_path):
            raise Exception("Unsafe path detected in tar file")
    tar.extractall(path)

def extract_tar(src, dest):
    log(f"  [*] Extracting TAR: {os.path.basename(src)}")
    try:
        with tarfile.open(src, "r:*") as tar:
            safe_extract_tar(tar, dest)
        log("  [+] TAR extract OK")
    except Exception as e:
        log(f"  [!] TAR extract failed: {e}")

def extract_zip(src, dest, password=None):
    log(f"  [*] Extracting ZIP: {os.path.basename(src)}")
    try:
        with zipfile.ZipFile(src, 'r') as zf:
            if password:
                try:
                    zf.extractall(dest, pwd=password.encode("utf-8"))
                except RuntimeError:
                    log("  [!] Wrong password? Trying without password...")
                    zf.extractall(dest)
            else:
                zf.extractall(dest)
        log("  [+] ZIP extract OK")
    except Exception as e:
        log(f"  [!] ZIP extract failed: {e}")

def process_archive(src_path, dest_root, password):
    """Determine type & extract accordingly."""
    name = os.path.basename(src_path)
    base, ext = os.path.splitext(name)

    dest_dir = os.path.join(dest_root, base)
    os.makedirs(dest_dir, exist_ok=True)

    lower = name.lower()
    if lower.endswith(".tar") or lower.endswith(".tgz") or lower.endswith(".tar.gz"):
        extract_tar(src_path, dest_dir)
    elif lower.endswith(".zip"):
        extract_zip(src_path, dest_dir, password)
    else:
        log(f"  [-] Unsupported file type: {name}")

def walk_and_extract(input_root, output_root, password):
    """Walk recursively and extract all supported archives."""
    log(f"[+] Scanning: {input_root}")

    for root, dirs, files in os.walk(input_root):
        for fname in files:
            fpath = os.path.join(root, fname)
            if any(fname.lower().endswith(ext) for ext in
                   (".tgz", ".tar.gz", ".tar", ".zip")):

                rel = os.path.relpath(root, input_root)
                out_dir = os.path.join(output_root, rel)
                os.makedirs(out_dir, exist_ok=True)

                log(f"\n[+] Found archive: {fpath}")
                process_archive(fpath, out_dir, password)

    log("\n[+] Extraction completed.")

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 extract_archives.py <input_dir> <output_dir> [password]")
        sys.exit(1)

    input_dir = os.path.abspath(sys.argv[1])
    output_dir = os.path.abspath(sys.argv[2])
    password = sys.argv[3] if len(sys.argv) >= 4 else None

    if not os.path.isdir(input_dir):
        print(f"[!] Not a directory: {input_dir}")
        sys.exit(1)

    os.makedirs(output_dir, exist_ok=True)

    walk_and_extract(input_dir, output_dir, password)

if __name__ == "__main__":
    main()


