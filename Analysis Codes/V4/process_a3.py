#!/usr/bin/env python3
import sys
import os
import re
from collections import defaultdict

FEATURE_ID = "A3"
USAGE = f"Usage: python3 process_{FEATURE_ID}.py <A3_hits_file> <source_js_file> <analysis_root>"


def get_label(hits_path: str) -> str:
    """
    Label is derived from the hits filename only (no full path),
    with the leading 'A3_' stripped if present.

    Example:
        static_features/A3_2025-09-16-@operato_utils-v9.0.51--segmented_bundle.js.txt
        -> label = 2025-09-16-@operato_utils-v9.0.51--segmented_bundle.js.txt
    """
    base = os.path.basename(hits_path)
    prefix = FEATURE_ID + "_"
    if base.startswith(prefix):
        return base[len(prefix):]
    return base


def resolve_output_paths(analysis_root: str, label: str):
    """
    Use the analysis_root passed from extract_features.py.

    analysis_root is already:
        <CWD>/Analysis/<PackageName>

    We place outputs in:
        <analysis_root>/Scores/
        <analysis_root>/Details/

    Output filenames DO NOT add '.txt' because `label`
    already includes the '.txt' from the hits file.
    """
    scores_dir = os.path.join(analysis_root, "Scores")
    details_dir = os.path.join(analysis_root, "Details")
    os.makedirs(scores_dir, exist_ok=True)
    os.makedirs(details_dir, exist_ok=True)

    counts_out = os.path.join(scores_dir, f"{FEATURE_ID}_score_{label}")
    detail_out = os.path.join(details_dir, f"{FEATURE_ID}_detail_{label}")
    return counts_out, detail_out


def load_source_bytes(source_path: str | None):
    if not source_path:
        return None, 0
    with open(source_path, "rb") as f:
        data = f.read()
    return data, len(data)


def slice_chars(data: bytes | None, n: int, start: int, end: int) -> str:
    """Safe byte slice -> utf8 string."""
    if data is None:
        return ""
    start = max(0, start)
    end = min(n, end)
    return data[start:end].decode("utf-8", errors="replace")


def main():
    if len(sys.argv) < 4:
        print(USAGE, file=sys.stderr)
        sys.exit(1)

    hits_path = sys.argv[1]
    source_path = sys.argv[2]
    analysis_root = sys.argv[3]

    label = get_label(hits_path)
    counts_out, detail_out = resolve_output_paths(analysis_root, label)

    # Load source (segmented file, typically)
    data, n = load_source_bytes(source_path)

    # ----------------------------------------------------------------
    # Step 1+2: Build structured entries from hits
    #   - base64Encoder(...)
    #   - something.toString("base64")
    # ----------------------------------------------------------------
    entries = []  # each entry: {offset, kind, text}

    with open(hits_path, "r", encoding="utf-8", errors="ignore") as hits:
        for line in hits:
            line = line.strip()
            if not line:
                continue
            # Lines look like: LINE:OFFSET:FRAGMENT
            parts = line.split(":", 2)
            if len(parts) < 3:
                continue
            _, off_str, frag = parts
            try:
                offset = int(off_str)
            except ValueError:
                continue

            frag = frag.strip()

            # CASE 1: base64Encoder(...) – try to reconstruct full call
            if "base64Encoder" in frag and data is not None:
                name_bytes = b"base64Encoder"
                # Try to find function name near the offset
                call_start = data.find(name_bytes, max(0, offset - 200))
                if call_start == -1:
                    # fallback: just show some context
                    ctx = slice_chars(data, n, offset - 80, offset + 80)
                    text = f"offset={offset} kind=base64Encoder context={ctx}"
                    entries.append(
                        {
                            "offset": offset,
                            "kind": "base64Encoder",
                            "text": text,
                        }
                    )
                    continue

                open_paren = data.find(b"(", call_start + len(name_bytes))
                if open_paren == -1:
                    ctx = slice_chars(data, n, call_start, call_start + 160)
                    text = f"offset={offset} kind=base64Encoder context={ctx}"
                    entries.append(
                        {
                            "offset": offset,
                            "kind": "base64Encoder",
                            "text": text,
                        }
                    )
                    continue

                # Match parentheses to find the end of the call
                depth = 0
                end_paren = None
                for i in range(open_paren, n):
                    b = data[i]
                    if b == ord("("):
                        depth += 1
                    elif b == ord(")"):
                        depth -= 1
                        if depth == 0:
                            end_paren = i
                            break

                if end_paren is None:
                    ctx = slice_chars(data, n, call_start, call_start + 200)
                    text = f"offset={offset} kind=base64Encoder context={ctx}"
                    entries.append(
                        {
                            "offset": offset,
                            "kind": "base64Encoder",
                            "text": text,
                        }
                    )
                else:
                    arg = slice_chars(data, n, open_paren + 1, end_paren).strip()
                    snippet = slice_chars(data, n, call_start, end_paren + 1)
                    text = (
                        f"offset={offset} kind=base64Encoder\n"
                        f"  call: {snippet}\n"
                        f"  arg:  {arg}\n"
                    )
                    entries.append(
                        {
                            "offset": offset,
                            "kind": "base64Encoder",
                            "text": text,
                        }
                    )

            # CASE 2: something.toString("base64") or fallback when no source
            else:
                if data is not None:
                    ctx = slice_chars(data, n, offset - 120, offset + 80)
                else:
                    # No source: at least preserve the fragment as context
                    ctx = frag
                text = (
                    f"offset={offset} kind=toString_base64\n"
                    f"  context: {ctx}\n"
                )
                entries.append(
                    {
                        "offset": offset,
                        "kind": "toString_base64",
                        "text": text,
                    }
                )

    # ----------------------------------------------------------------
    # Step 3: Classify each entry
    #   SECRETS / CONFIG_OR_URL / LOG_OR_MESSAGE / OTHER
    # ----------------------------------------------------------------
    SECRET_WORDS = [
        "secret",
        "token",
        "credential",
        "password",
        "passphrase",
        "auth",
        "authorization",
        "bearer",
        "access_key",
        "secret_key",
        "npm_token",
        "github_token",
        "aws_access_key_id",
        "aws_secret_access_key",
    ]

    LOG_WORDS = [
        "log(",
        "logger",
        "logging",
        "trace",
        "debug",
        "info",
        "warn",
        "error",
        "message",
    ]

    CONFIG_WORDS = [
        "http://",
        "https://",
        "url",
        ".json",
        "config",
        "endpoint",
        "uri",
    ]

    def classify(text: str) -> str:
        t = text.lower()
        if any(w in t for w in SECRET_WORDS):
            return "SECRETS"
        if any(w in t for w in LOG_WORDS):
            return "LOG_OR_MESSAGE"
        if any(w in t for w in CONFIG_WORDS):
            return "CONFIG_OR_URL"
        return "OTHER"

    buckets: dict[str, list] = defaultdict(list)
    for e in entries:
        cat = classify(e["text"])
        e["category"] = cat
        buckets[cat].append(e)

    total = len(entries)

    # ----------------------------------------------------------------
    # 1) Score / counts file
    # ----------------------------------------------------------------
    with open(counts_out, "w", encoding="utf-8") as out:
        out.write(f"{FEATURE_ID}_total_sites={total}\n")
        out.write(f"{FEATURE_ID}_SECRETS={len(buckets['SECRETS'])}\n")
        out.write(
            f"{FEATURE_ID}_CONFIG_OR_URL={len(buckets['CONFIG_OR_URL'])}\n"
        )
        out.write(
            f"{FEATURE_ID}_LOG_OR_MESSAGE={len(buckets['LOG_OR_MESSAGE'])}\n"
        )
        out.write(f"{FEATURE_ID}_OTHER={len(buckets['OTHER'])}\n")

    # ----------------------------------------------------------------
    # 2) Summary + detailed suspicious entries
    # ----------------------------------------------------------------
    with open(detail_out, "w", encoding="utf-8") as out:
        out.write("===========================================\n")
        out.write("   A3 base64 Encoding – Summary\n")
        out.write("===========================================\n\n")
        out.write(f"Source hits file={hits_path}\n")
        out.write(f"Source code file={source_path or 'N/A'}\n\n")

        out.write("[Summary]\n")
        out.write(f"A3_total_sites={total}\n")
        out.write(f"A3_SECRETS={len(buckets['SECRETS'])}\n")
        out.write(
            f"A3_CONFIG_OR_URL={len(buckets['CONFIG_OR_URL'])}\n"
        )
        out.write(
            f"A3_LOG_OR_MESSAGE={len(buckets['LOG_OR_MESSAGE'])}\n"
        )
        out.write(f"A3_OTHER={len(buckets['OTHER'])}\n\n")

        out.write("[Details]\n")
        out.write(f"target_label={label}\n")
        out.write(f"arg1(hits_file)={hits_path}\n")
        out.write(f"arg2(source_file)={source_path or 'N/A'}\n\n")

        # dump suspicious ones with some detail
        for cat in ["SECRETS", "CONFIG_OR_URL"]:
            out.write(f"===== {cat} (count={len(buckets[cat])}) =====\n\n")
            for e in buckets[cat]:
                out.write(
                    f"offset={e.get('offset')} kind={e.get('kind')} "
                    f"category={e['category']}\n"
                )
                out.write(e.get("text", "") + "\n\n")

    print(f"[+] {FEATURE_ID} scores written to {counts_out}")
    print(f"[+] {FEATURE_ID} summary written to {detail_out}")


if __name__ == "__main__":
    main()


