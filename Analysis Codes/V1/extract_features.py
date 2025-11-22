#!/usr/bin/env python3
import os
import re
import sys
import subprocess
from pathlib import Path

# ============================================
# Config
# ============================================

# Features per file
FEATURES = [
    "A1", "A2", "A3",
    "B1", "B2",
    "C1", "C2", "C3",
    "D1", "D2",
    "E1", "E2",
]

# Regex patterns (for rg-based features)
PATTERNS = {
    # A. EXECUTION / PAYLOAD
    "A1": r'child_process\.(exec|spawn|execSync|fork)\(|\beval\(|new Function\(',
    "A2": r'Buffer\.from\([^)]*["\']base64["\']\)|\batob\(|Base64\.decode\(',
    "A3": r'\.toString\(\s*["\']base64["\']\s*\)|Base64\.encode\(|base64Encoder',

    # B. TOKEN / CREDENTIAL ACCESS
    "B1": (
        r'process\.env\.('
        r'NPM_TOKEN|GITHUB_TOKEN|GITLAB_TOKEN|CI_JOB_TOKEN|'
        r'AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|AWS_SESSION_TOKEN|'
        r'AZURE_[A-Z0-9_]*|GOOGLE_[A-Z0-9_]*'
        r')'
    ),
    "B2": r'\.npmrc|\.gitconfig|id_rsa|id_dsa|known_hosts|authorized_keys|ssh-agent|SSH_AUTH_SOCK',

    # C. NETWORK ACTIVITY
    "C1": r'https?://[^\s"\'<>)]+',

    # C2 – special endpoints (hostnames, used with additional filtering)
    "C2": (
        r'(webhook\.site|requestbin|pastebin\.com|ngrok\.io|'
        r'discord\.com/api/webhooks|raw\.githubusercontent\.com|'
        r'gist\.github\.com|sts\.amazonaws\.com|signin\.aws\.amazon\.com|'
        r'accounts\.google\.com|login\.microsoftonline\.com|'
        r'graph\.microsoft\.com)'
    ),

    # C3 – network / IO primitives
    "C3": (
        r'(require\(["\']https?["\']\)|require\(["\']dns["\']\)|require\(["\']net["\']\)|'
        r'require\(["\']tls["\']\)|require\(["\']child_process["\']\)|'
        r'new\s+WebSocket|XMLHttpRequest|fetch\s*\(|exec\(|spawn\()'
    ),

    # D1 – multi-ecosystem publish/auth/push
    "D1": (
        r'\b('
        r'npm|yarn|pnpm|bun|poetry|pip|flit|cargo|go|mvn|gradle|'
        r'docker|podman|dotnet|nuget|gh|git'
        r')\s*('
        r'publish|adduser|login|token|auth|push|upload|release|credentials|credential'
        r')\b'
    ),

    # E1 – long base64-like literals
    "E1": r'[A-Za-z0-9+/]{40,}={0,2}',
}

# F1 (lifecycle hooks in package.json) – only used on package.json
F1_PATTERN = (
    r'"(preinstall|install|postinstall|prepare|prepack|postpack|'
    r'preversion|version|postversion|prepublish|prepublishOnly|publish|postpublish|'
    r'prerestart|restart|postrestart|prerestore|restore|postrestore|'
    r'pretest|test|posttest|prebuild|build|postbuild)"\s*:'
)

SPECIAL_URL = re.compile(PATTERNS["C2"])
HTTP_URL = re.compile(r"https?://")

# obvious binary-ish extensions
BINARY_EXTS = {
    ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico",
    ".webp", ".mp3", ".mp4", ".avi", ".mov", ".mkv",
    ".zip", ".tar", ".gz", ".tgz", ".bz2", ".7z",
    ".woff", ".woff2", ".ttf", ".eot",
    ".pdf", ".exe", ".dll", ".so", ".dylib", ".wasm",
}

# segment_minified thresholds
MAX_LINES_THRESHOLD = 10
LONG_LINE_THRESHOLD = 5000


# ============================================
# Helpers
# ============================================

def usage():
    print("Usage: python3 extract_features_A_to_F.py <my_extracted_pkg>", file=sys.stderr)
    sys.exit(1)


def is_probably_binary(path: Path, sniff_bytes: int = 4096) -> bool:
    """Skip known binary extensions or files with NUL bytes."""
    if path.suffix.lower() in BINARY_EXTS:
        return True
    try:
        with path.open("rb") as f:
            chunk = f.read(sniff_bytes)
    except OSError:
        return True
    if b"\x00" in chunk:
        return True
    return False


def sanitize_tag(pkg_root: Path, file_path: Path) -> str:
    """
    Convert a relative path under pkg_root into a safe tag:
        src/utils/helpers.js -> src_utils_helpers_js
    """
    rel = file_path.relative_to(pkg_root)
    return str(rel).replace("/", "_").replace("\\", "_")


def run_rg(pattern: str, infile: Path, outfile: Path, only_matching: bool = True):
    """Wrapper around ripgrep (-n --byte-offset)."""
    cmd = ["rg", "-n", "--byte-offset"]
    if only_matching:
        cmd.append("-o")
    cmd.extend([pattern, str(infile)])

    with outfile.open("w", encoding="utf-8") as out:
        subprocess.run(cmd, stdout=out, stderr=subprocess.DEVNULL,
                       text=True, check=False)


def detect_long_lines(file_path: Path, out_path: Path, threshold: int = 1000):
    """E2: write 'line:length' for lines longer than threshold."""
    with file_path.open("r", encoding="utf-8", errors="replace") as f, \
         out_path.open("w", encoding="utf-8") as out:
        for i, line in enumerate(f, start=1):
            ln_len = len(line.rstrip("\n"))
            if ln_len > threshold:
                out.write(f"{i}:{ln_len}\n")


# ============================================
# segment_minified logic (inline version)
# ============================================

def analyze_minified(path: Path):
    """Return (total_lines, max_len) for the given text file."""
    total_lines = 0
    max_len = 0
    with path.open("r", encoding="utf-8", errors="replace") as f:
        for line in f:
            total_lines += 1
            ln_len = len(line.rstrip("\n"))
            if ln_len > max_len:
                max_len = ln_len
    return total_lines, max_len


def transform_like_sed(text: str) -> str:
    """
    Equivalent to your segment_minified sed:
        s/;/;\\n/g
        s/{/{\\n/g
        s/}/}\\n/g
        s/\\bvar\\b/\\nvar/g
        s/\\blet\\b/\\nlet/g
        s/\\bconst\\b/\\nconst/g
    """
    text = text.replace(";", ";\n")
    text = text.replace("{", "{\n")
    text = text.replace("}", "}\n")

    text = re.sub(r"\bvar\b", "\nvar", text)
    text = re.sub(r"\blet\b", "\nlet", text)
    text = re.sub(r"\bconst\b", "\nconst", text)

    return text


def prepare_analysis_file(path: Path) -> Path:
    """
    Implements segment_minified.py behavior:
    - If total_lines < 10 AND any line > 5000 chars:
        -> create segmented_<filename> next to original
        -> return that path
    - Else:
        -> return original path
    """
    total_lines, max_len = analyze_minified(path)

    if total_lines < MAX_LINES_THRESHOLD and max_len > LONG_LINE_THRESHOLD:
        directory = path.parent
        out_name = "segmented_" + path.name
        out_path = directory / out_name

        with path.open("r", encoding="utf-8", errors="replace") as src:
            content = src.read()
        transformed = transform_like_sed(content)
        with out_path.open("w", encoding="utf-8") as dst:
            dst.write(transformed)

        return out_path

    return path


# ============================================
# D2: script / package.json manipulation detector
# (PKGWRITE / SCRIPTS / HOOKSTR tags)
# ============================================

PKGWRITE_RE = re.compile(
    r'fs\.(writeFile|writeFileSync|appendFile|createWriteStream)\([^)]*package\.json'
)
SCRIPTS_RE = re.compile(r'(scripts"\s*:|\.scripts\b|\["scripts"\])')
HOOKSTR_RE = re.compile(
    r'"(preinstall|install|postinstall|prepare|prepack|postpack|'
    r'preversion|version|postversion|prepublish|prepublishOnly|publish|postpublish|'
    r'prerestart|restart|postrestart|prebuild|build|postbuild)"'
)


def extract_D2(analysis_path: Path, out_file: Path):
    """
    Write labeled lines:
        [PKGWRITE] line:offset:text
        [SCRIPTS]  line:offset:text
        [HOOKSTR]  line:offset:text
    """
    with analysis_path.open("r", encoding="utf-8", errors="replace") as f, \
         out_file.open("w", encoding="utf-8") as out:
        for lineno, line in enumerate(f, start=1):
            raw = line.rstrip("\n")

            # PKGWRITE
            for m in PKGWRITE_RE.finditer(raw):
                off = m.start()
                out.write(f"[PKGWRITE] {lineno}:{off}:{raw}\n")

            # SCRIPTS
            for m in SCRIPTS_RE.finditer(raw):
                off = m.start()
                out.write(f"[SCRIPTS] {lineno}:{off}:{raw}\n")

            # HOOKSTR
            for m in HOOKSTR_RE.finditer(raw):
                off = m.start()
                out.write(f"[HOOKSTR] {lineno}:{off}:{raw}\n")


# ============================================
# Per-file extraction (A–E + D2)
# ============================================

def extract_for_file(pkg_root: Path,
                     original_path: Path,
                     analysis_path: Path,
                     static_dir: Path):
    """
    Run A1–E2 + D1 + D2 on analysis_path.
    Output files named like A1_extraction_<tag>.
    """
    tag = sanitize_tag(pkg_root, original_path)
    print(f"[*] Extracting features from {original_path} (analysis on {analysis_path})")

    for feat in FEATURES:
        out_file = static_dir / f"{feat}_extraction_{tag}"

        if feat == "C2":
            # special-interest hostnames, but exclude lines that already contain a full URL
            rg_out = subprocess.run(
                ["rg", "-n", "--byte-offset", PATTERNS["C2"], str(analysis_path)],
                capture_output=True,
                text=True,
                check=False,
            ).stdout.splitlines()

            with out_file.open("w", encoding="utf-8") as f:
                for line in rg_out:
                    if not HTTP_URL.search(line):
                        f.write(line + "\n")
            continue

        if feat == "C3":
            # network/IO primitives, minus obvious URLs and special exfil hosts
            rg_out = subprocess.run(
                ["rg", "-n", "--byte-offset", PATTERNS["C3"], str(analysis_path)],
                capture_output=True,
                text=True,
                check=False,
            ).stdout.splitlines()

            with out_file.open("w", encoding="utf-8") as f:
                for line in rg_out:
                    if HTTP_URL.search(line):
                        continue
                    if SPECIAL_URL.search(line):
                        continue
                    f.write(line + "\n")
            continue

        if feat == "D2":
            # script/package.json manipulation
            extract_D2(analysis_path, out_file)
            continue

        if feat == "E2":
            # very long lines
            detect_long_lines(analysis_path, out_file)
            continue

        # All other rg-based patterns
        if feat in PATTERNS:
            run_rg(PATTERNS[feat], analysis_path, out_file, only_matching=True)
        else:
            # safety: create empty file
            out_file.write_text("", encoding="utf-8")

    print(f"    → wrote A1..E2 + D1/D2 for {original_path}")


# ============================================
# F1: lifecycle hooks in package.json
# ============================================

def extract_F1(pkg_root: Path, static_dir: Path, analysis_map):
    """
    Run only once, on root package.json (if present).
    Uses the segmented_ version if that exists in analysis_map.
    """
    pkg_json = pkg_root / "package.json"
    if not pkg_json.is_file():
        print("[F1] No package.json found; skipping F1.")
        return

    analysis_path = analysis_map.get(pkg_json, pkg_json)
    tag = "package_json"
    out_file = static_dir / f"F1_extraction_{tag}"

    print(f"[*] Extracting F1 (lifecycle hooks) from {analysis_path}")

    run_rg(F1_PATTERN, analysis_path, out_file, only_matching=True)

    print(f"    → wrote F1_extraction_{tag}")


# ============================================
# Main
# ============================================

def main():
    if len(sys.argv) != 2:
        usage()

    pkg_dir = Path(sys.argv[1]).resolve()
    if not pkg_dir.is_dir():
        print(f"Error: '{pkg_dir}' is not a directory", file=sys.stderr)
        sys.exit(1)

    static_dir = pkg_dir / "static_features"
    static_dir.mkdir(exist_ok=True)

    print("======================================")
    print(f"  Static feature extraction (A–F) for: {pkg_dir}")
    print("======================================")

    # Walk all files under the package
    files = []
    for p in pkg_dir.rglob("*"):
        if not p.is_file():
            continue
        # skip our own outputs and node_modules
        if "node_modules" in p.parts:
            continue
        if static_dir in p.parents or p == static_dir:
            continue
        # skip any segmented_ files (we create them ourselves)
        if p.name.startswith("segmented_"):
            continue
        # skip obvious binaries
        if is_probably_binary(p):
            continue
        files.append(p)

    print(f"  Found {len(files)} text-like files to scan\n")

    # Map from original path -> analysis path (segmented or original)
    analysis_map = {}

    # First: prepare segmented versions where needed, then run A–E + D2
    for f in files:
        analysis_path = prepare_analysis_file(f)
        analysis_map[f] = analysis_path
        extract_for_file(pkg_dir, f, analysis_path, static_dir)

    # Finally: F1 (lifecycle hooks) only on package.json
    extract_F1(pkg_dir, static_dir, analysis_map)

    print("\n[✓] Static feature extraction A–F complete.")
    print(f"    Output directory: {static_dir}")


if __name__ == "__main__":
    main()


