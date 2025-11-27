#!/usr/bin/env python3
"""
extract_features.py
Usage:
    python3 extract_features.py <package_root>

Given an extracted npm package directory, this script:
  * Walks all JS/TS files.
  * For each file:
      - If it looks minified (<=10 lines AND some line > 5000 chars),
        creates a segmented_<filename> with pseudo-lines under
        Analysis/<PackageName>/Segmented_Files/ (mirroring the package tree).
      - Runs A1..E2 feature extractors on the appropriate file
        (segmented if present; E2 always uses the original file).
      - Writes hits into Analysis/<PackageName>/static_features/
        as <FEATURE>_extraction_<relpath-with-->.txt
      - Immediately calls the corresponding process_<feature>.py
        if that script exists in the same directory, passing the
        hits file, optional source file, and the analysis root path.
  * For package.json:
      - Runs F1 (lifecycle hooks / optionalDependencies / scripts)
        and calls process_f1.py.

Features:
  A1  – def find_package_json(pkg_root: str) -> str | None:

      Try to locate package.json for F1:
      1) <pkg_root>/package.json
      2) <pkg_root>/package/package.json  (common npm pack layout)
      3) First package.json found anywhere under pkg_root (fallback)

    # 1) direct
    direct = os.path.join(pkg_root, "package.json")
    if os.path.exists(direct):
        return direct

    # 2) common 'package/' subdir from npm pack
    alt = os.path.join(pkg_root, "package", "package.json")
    if os.path.exists(alt):
        return alt

    # 3) last resort: walk and pick the first one
    for dirpath, _, filenames in os.walk(pkg_root):
        if "package.json" in filenames:
            return os.path.join(dirpath, "package.json")

    return None


def extract_f1_for_package(pkg_root: str, static_dir: str, analysis_root: str):
    pkg_json = find_package_json(pkg_root)
    if not pkg_json:
        return

    # Label relative to pkg_root so we keep the location info
    rel = os.path.relpath(pkg_json, pkg_root)
    label = sanitize_label(rel)  # e.g. 'package--package.json'
    out_path = os.path.join(static_dir, f"F1_extraction_{label}.txt")

    with open(pkg_json, "r", encoding="utf-8", errors="ignore") as f, \
         open(out_path, "w", encoding="utf-8") as out:
        for lineno, line in enumerate(f, start=1):
            text = line.rstrip("\n")
            if (
                F1_HOOK_RE.search(text)
                or F1_OPTDEP_RE.search(text)
                or F1_SCRIPTS_RE.search(text)
            ):
                out.write(f"{lineno}:0:{text}\n")

    run_processor("F1", None, out_path, analysis_root)

exec/eval/new Function
  A2  – base64 decode
  A3  – base64 encode
  B1  – process.env secrets
  B2  – token / auth flows (secret files etc., depending on your rg port)
  C1  – all URLs (for process_c1.py aggregation)
  C2  – special exfil / auth endpoints
  C3  – network / child process capabilities
  D1  – publish / auth / push to registries (npm, git, gh, etc.)
  D2  – code-level script / package.json manipulation hints
  E1  – long base64-like literals (EXTRACT ONLY, no processor)
  E2  – very long lines in original source
  F1  – lifecycle hooks / optionalDependencies / scripts in package.json
"""

import os
import re
import sys
import subprocess

# ---------------------------------------------------------------------------
# Helpers for running per-feature processors
# ---------------------------------------------------------------------------

def sanitize_label(path: str) -> str:
    """Turn 'src/foo/bar.js' into 'src--foo--bar.js'."""
    return path.replace(os.sep, "--").replace("\\", "--")


# Which process_* script to call, and whether it needs the source file.
PROCESS_CONFIG = {
    "A1": {"script": "process_a1.py", "needs_source": True},
    "A2": {"script": "process_a2.py", "needs_source": True},
    "A3": {"script": "process_a3.py", "needs_source": True},
    "B1": {"script": "process_b1.py", "needs_source": False},
    "B2": {"script": "process_b2.py", "needs_source": False},
    "C1": {"script": "process_c1.py", "needs_source": False},
    "C2": {"script": "process_c2.py", "needs_source": False},
    "C3": {"script": "process_c3.py", "needs_source": False},
    "D1": {"script": "process_d1.py", "needs_source": False},
    "D2": {"script": "process_d2.py", "needs_source": False},
    "E2": {"script": "process_e2.py", "needs_source": False},
    "F1": {"script": "process_f1.py", "needs_source": False},
    # E1 intentionally has no processor
}


def run_processor(
    feature: str,
    source_path: str | None,
    hits_path: str,
    analysis_root: str,
):
    """
    Call the appropriate process_<feature>.py in the same directory as this script.

    Calling convention (keeps current process_* scripts working):
      - If needs_source:
            process_xx.py <hits_path> <source_path> <analysis_root>
      - Else:
            process_xx.py <hits_path> <analysis_root>

    Existing process_* scripts that only read the first 1–2 args
    will ignore the extra analysis_root parameter.
    """
    cfg = PROCESS_CONFIG.get(feature)
    if not cfg:
        return

    script_name = cfg["script"]
    needs_source = cfg["needs_source"]
    here = os.path.dirname(os.path.abspath(__file__))
    script_path = os.path.join(here, script_name)

    if not os.path.exists(script_path):
        # Processor not present yet – silently skip.
        return

    if needs_source:
        if source_path is None:
            return
        argv = [sys.executable, script_path, hits_path, source_path, analysis_root]
    else:
        argv = [sys.executable, script_path, hits_path, analysis_root]

    try:
        subprocess.run(argv, check=True)
    except subprocess.CalledProcessError as e:
        print(f"[!] {feature} processor failed on {hits_path}: {e}", file=sys.stderr)


# ---------------------------------------------------------------------------
# Minified detection and segmentation
# ---------------------------------------------------------------------------

JS_EXTS = (".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx")


def maybe_segment_minified(
    pkg_root: str,
    path: str,
    segmented_root: str,
) -> str:
    """
    If file looks minified (<= 10 lines AND any line > 5000 chars),
    create segmented_<basename> with pseudo-lines under:

        segmented_root/<rel_dir>/segmented_<basename>

    where <rel_dir> mirrors the original directory structure
    relative to pkg_root.

    Returns the path to the file to scan (segmented or original).
    """
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()
    except OSError:
        return path

    if len(lines) > 10 or not any(len(ln) > 5000 for ln in lines):
        return path  # not minified enough

    text = "".join(lines)

    # Apply the sed-like transformations:
    text = text.replace(";", ";\n")
    text = text.replace("{", "{\n")
    text = text.replace("}", "}\n")
    text = re.sub(r"\bvar\b", r"\nvar", text)
    text = re.sub(r"\blet\b", r"\nlet", text)
    text = re.sub(r"\blet\b", r"\nlet", text)
    text = re.sub(r"\bconst\b", r"\nconst", text)

    # Mirror the package directory structure under segmented_root
    rel = os.path.relpath(path, pkg_root)
    seg_target_dir = os.path.join(segmented_root, os.path.dirname(rel))
    os.makedirs(seg_target_dir, exist_ok=True)
    out_path = os.path.join(seg_target_dir, "segmented_" + os.path.basename(path))

    try:
        with open(out_path, "w", encoding="utf-8") as out:
            out.write(text)
    except OSError as e:
        print(f"[!] Failed to write segmented file for {path}: {e}", file=sys.stderr)
        return path

    return out_path


# ---------------------------------------------------------------------------
# Regex patterns (mirror your original rg commands)
# ---------------------------------------------------------------------------

A1_RE = re.compile(
    r"child_process\.(exec|spawn|execSync|fork)\(|\beval\(|new Function\(",
    re.MULTILINE,
)
A2_RE = re.compile(
    r"Buffer\.from\([^)]*['\"]base64['\"]\)|\batob\(|Base64\.decode\(",
    re.MULTILINE,
)
A3_RE = re.compile(
    r"\.toString\(\s*['\"]base64['\"]\s*\)|Base64\.encode\(|base64Encoder",
    re.MULTILINE,
)
B1_RE = re.compile(
    r"process\.env\.(NPM_TOKEN|GITHUB_TOKEN|GITLAB_TOKEN|CI_JOB_TOKEN|"
    r"AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|AWS_SESSION_TOKEN|"
    r"AZURE_[A-Z0-9_]*|GOOGLE_[A-Z0-9_]*)"
)
B2_RE = re.compile(
    r"\.npmrc|\.gitconfig|id_rsa|id_dsa|known_hosts|authorized_keys|ssh-agent|SSH_AUTH_SOCK"
)
C1_RE = re.compile(r"https?://[^\s\"'<>)]+")
C2_RE = re.compile(
    r"(webhook\.site|requestbin|pastebin\.com|ngrok\.io|"
    r"discord\.com/api/webhooks|raw\.githubusercontent\.com|"
    r"gist\.github\.com|sts\.amazonaws\.com|signin\.aws\.amazonaws\.com|"
    r"accounts\.google\.com|login\.microsoftonline\.com|graph\.microsoft\.com)"
)
C3_RE = re.compile(
    r"(child_process\.(exec|spawn|execSync|fork)|"
    r"\bfetch\s*\(|new\s+WebSocket|new\s+XMLHttpRequest|"
    r"require\(\s*['\"](https?|net|tls)['\"]\s*\)|"
    r"require\(\s*['\"]dns['\"]\s*\)|\.request\s*\()",
    re.IGNORECASE,
)
D1_RE = re.compile(
    r"\b(npm|yarn|pnpm|bun|poetry|pip|flit|cargo|go|mvn|gradle|docker|podman|dotnet|nuget|gh|git)"
    r"\s*(publish|adduser|login|token|auth|push|upload|release|credentials|credential)\b"
)

D2_PKGWRITE_RE = re.compile(
    r"fs\.(writeFile|writeFileSync|appendFile|createWriteStream)\([^)]*package\.json"
)
D2_SCRIPTS_RE = re.compile(r'(scripts"\s*:|\.scripts\b|\["scripts"\])')
D2_HOOKSTR_RE = re.compile(
    r'"(preinstall|install|postinstall|prepare|prepack|postpack|preversion|version|'
    r'postversion|prepublish|prepublishOnly|publish|postpublish|prerestart|restart|'
    r'postrestart|prebuild|build|postbuild)"'
)

E1_RE = re.compile(r"[A-Za-z0-9+/]{40,}={0,2}")

F1_HOOK_RE = D2_HOOKSTR_RE
F1_OPTDEP_RE = re.compile(r'"optionalDependencies"\s*:')
F1_SCRIPTS_RE = re.compile(r'"scripts"\s*:')


# ---------------------------------------------------------------------------
# Per-file feature extraction
# ---------------------------------------------------------------------------

def byte_offset(text: str, char_pos: int) -> int:
    """Return UTF-8 byte offset for a character position."""
    return len(text[:char_pos].encode("utf-8"))


def extract_for_file(
    pkg_root: str,
    src_path: str,
    static_dir: str,
    segmented_root: str,
    analysis_root: str,
):
    """
    Run A1..E2 (except F1) on a single JS/TS file.
    """
    rel_path = os.path.relpath(src_path, pkg_root)
    label = sanitize_label(rel_path)

    # Use segmented copy if minified; store segments under Analysis/.../Segmented_Files
    scan_path = maybe_segment_minified(pkg_root, src_path, segmented_root)

    try:
        with open(scan_path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
    except OSError as e:
        print(f"[!] Could not read {scan_path}: {e}", file=sys.stderr)
        return

    # Prepare hit-file paths (now with .txt extension) under Analysis/<pkg>/static_features
    paths: dict[str, str] = {}
    for feat in ["A1", "A2", "A3", "B1", "B2", "C1", "C2", "C3", "D1", "D2", "E1", "E2"]:
        paths[feat] = os.path.join(static_dir, f"{feat}_extraction_{label}.txt")

    # Open hit files
    files = {feat: open(p, "w", encoding="utf-8") for feat, p in paths.items()}

    # --- A1 ---
    for m in A1_RE.finditer(text):
        line_no = text.count("\n", 0, m.start()) + 1
        off = byte_offset(text, m.start())
        files["A1"].write(f"{line_no}:{off}:{m.group(0)}\n")

    # --- A2 ---
    for m in A2_RE.finditer(text):
        line_no = text.count("\n", 0, m.start()) + 1
        off = byte_offset(text, m.start())
        files["A2"].write(f"{line_no}:{off}:{m.group(0)}\n")

    # --- A3 ---
    for m in A3_RE.finditer(text):
        line_no = text.count("\n", 0, m.start()) + 1
        off = byte_offset(text, m.start())
        files["A3"].write(f"{line_no}:{off}:{m.group(0)}\n")

    # --- B1 ---
    for m in B1_RE.finditer(text):
        line_no = text.count("\n", 0, m.start()) + 1
        off = byte_offset(text, m.start())
        files["B1"].write(f"{line_no}:{off}:{m.group(0)}\n")

    # --- B2 ---
    for m in B2_RE.finditer(text):
        line_no = text.count("\n", 0, m.start()) + 1
        off = byte_offset(text, m.start())
        files["B2"].write(f"{line_no}:{off}:{m.group(0)}\n")

    # --- C1 ---
    for m in C1_RE.finditer(text):
        line_no = text.count("\n", 0, m.start()) + 1
        off = byte_offset(text, m.start())
        files["C1"].write(f"{line_no}:{off}:{m.group(0)}\n")

    # --- C2 ---
    for m in C2_RE.finditer(text):
        line_no = text.count("\n", 0, m.start()) + 1
        off = byte_offset(text, m.start())
        files["C2"].write(f"{line_no}:{off}:{m.group(0)}\n")

    # --- C3 ---
    for m in C3_RE.finditer(text):
        line_no = text.count("\n", 0, m.start()) + 1
        off = byte_offset(text, m.start())
        files["C3"].write(f"{line_no}:{off}:{m.group(0)}\n")

    # --- D1 ---
    for m in D1_RE.finditer(text):
        line_no = text.count("\n", 0, m.start()) + 1
        off = byte_offset(text, m.start())
        files["D1"].write(f"{line_no}:{off}:{m.group(0)}\n")

    # --- D2 (script manipulation tags) ---
    for lineno, line in enumerate(text.splitlines(), start=1):
        if D2_PKGWRITE_RE.search(line):
            files["D2"].write(f"[PKGWRITE] {rel_path}:{lineno}:{line.strip()}\n")
        if D2_SCRIPTS_RE.search(line):
            files["D2"].write(f"[SCRIPTS] {rel_path}:{lineno}:{line.strip()}\n")
        if D2_HOOKSTR_RE.search(line):
            files["D2"].write(f"[HOOKSTR] {rel_path}:{lineno}:{line.strip()}\n")

    # --- E1 (long base64-like strings) ---
    for m in E1_RE.finditer(text):
        line_no = text.count("\n", 0, m.start()) + 1
        off = byte_offset(text, m.start())
        files["E1"].write(f"{line_no}:{off}:{m.group(0)}\n")

    # --- E2 (very long original lines – NOT segmented) ---
    try:
        with open(src_path, "r", encoding="utf-8", errors="ignore") as orig:
            for lineno, line in enumerate(orig, start=1):
                L = len(line.rstrip("\n"))
                if L > 1000:
                    files["E2"].write(f"{lineno}:{L}\n")
    except OSError as e:
        print(f"[!] Could not read original for E2 {src_path}: {e}", file=sys.stderr)

    # Close all hit files
    for f in files.values():
        f.close()

    # Run processors (now with analysis_root passed as extra arg)
    run_processor("A1", scan_path, paths["A1"], analysis_root)
    run_processor("A2", scan_path, paths["A2"], analysis_root)
    run_processor("A3", scan_path, paths["A3"], analysis_root)
    run_processor("B1", None, paths["B1"], analysis_root)
    run_processor("B2", None, paths["B2"], analysis_root)
    run_processor("C1", None, paths["C1"], analysis_root)
    run_processor("C2", None, paths["C2"], analysis_root)
    run_processor("C3", None, paths["C3"], analysis_root)
    run_processor("D1", None, paths["D1"], analysis_root)
    run_processor("D2", None, paths["D2"], analysis_root)
    # E1 has no processor
    run_processor("E2", None, paths["E2"], analysis_root)


# ---------------------------------------------------------------------------
# F1: package.json lifecycle hooks
# ---------------------------------------------------------------------------

def find_package_json(pkg_root: str) -> str | None:
    """
    Try to locate package.json for F1:
      1) <pkg_root>/package.json
      2) <pkg_root>/package/package.json  (common npm pack layout)
      3) First package.json found anywhere under pkg_root (fallback)
    """
    # 1) direct
    direct = os.path.join(pkg_root, "package.json")
    if os.path.exists(direct):
        return direct

    # 2) common 'package/' subdir from npm pack
    alt = os.path.join(pkg_root, "package", "package.json")
    if os.path.exists(alt):
        return alt

    # 3) last resort: walk and pick the first one
    for dirpath, _, filenames in os.walk(pkg_root):
        if "package.json" in filenames:
            return os.path.join(dirpath, "package.json")

    return None


def extract_f1_for_package(pkg_root: str, static_dir: str, analysis_root: str):
    pkg_json = find_package_json(pkg_root)
    if not pkg_json:
        return

    # Label relative to pkg_root so we keep the location info
    rel = os.path.relpath(pkg_json, pkg_root)
    label = sanitize_label(rel)  # e.g. 'package--package.json'
    out_path = os.path.join(static_dir, f"F1_extraction_{label}.txt")

    with open(pkg_json, "r", encoding="utf-8", errors="ignore") as f, \
         open(out_path, "w", encoding="utf-8") as out:
        for lineno, line in enumerate(f, start=1):
            text = line.rstrip("\n")
            if (
                F1_HOOK_RE.search(text)
                or F1_OPTDEP_RE.search(text)
                or F1_SCRIPTS_RE.search(text)
            ):
                out.write(f"{lineno}:0:{text}\n")

    run_processor("F1", None, out_path, analysis_root)




# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    if len(sys.argv) != 2:
        print("Usage: python3 extract_features.py <package_root>", file=sys.stderr)
        sys.exit(1)

    pkg_root = os.path.abspath(sys.argv[1])
    if not os.path.isdir(pkg_root):
        print(f"Error: {pkg_root} is not a directory", file=sys.stderr)
        sys.exit(1)

    # Package name from the argument path
    package_name = os.path.basename(pkg_root.rstrip(os.sep))

    # Analysis root anchored at the current working directory
    cwd = os.getcwd()
    analysis_root = os.path.join(cwd, "Analysis", package_name)

    # Segmented files under Analysis/<pkg>/Segmented_Files
    segmented_root = os.path.join(analysis_root, "Segmented_Files")
    os.makedirs(segmented_root, exist_ok=True)

    # Hits under Analysis/<pkg>/static_features
    static_dir = os.path.join(analysis_root, "static_features")
    os.makedirs(static_dir, exist_ok=True)

    # One-time F1 on package.json
    extract_f1_for_package(pkg_root, static_dir, analysis_root)

    # Walk JS/TS files
    for dirpath, dirnames, filenames in os.walk(pkg_root):
        # Skip some noisy dirs (within the package itself)
        dirnames[:] = [
            d for d in dirnames
            if d not in ("node_modules", ".git", ".hg", ".svn")
        ]
        for filename in filenames:
            if not filename.lower().endswith(JS_EXTS):
                continue
            full_path = os.path.join(dirpath, filename)
            print(f"[+] Scanning {os.path.relpath(full_path, pkg_root)}")
            extract_for_file(
                pkg_root,
                full_path,
                static_dir,
                segmented_root,
                analysis_root,
            )

    print("[+] Feature extraction complete.")


if __name__ == "__main__":
    main()


