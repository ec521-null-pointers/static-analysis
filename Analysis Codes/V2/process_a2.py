#!/usr/bin/env python3
import sys
import os
import re

FEATURE_ID = "A2"

USAGE = f"Usage: python3 process_{FEATURE_ID}.py <A2_hits_file> <source_js_file>"


def get_label(hits_path: str) -> str:
    """
    Strip leading 'A2_' from basename to get a per-file label.
    Example:
        A2_home--yishun--...--bundle_flow.js  ->  home--yishun--...--bundle_flow.js
    """
    base = os.path.basename(hits_path)
    prefix = FEATURE_ID + "_"
    if base.startswith(prefix):
        return base[len(prefix):]
    return base


def load_source_bytes(source_path: str | None):
    if not source_path:
        return None, 0
    with open(source_path, "rb") as f:
        data = f.read()
    return data, len(data)


def window(data: bytes | None, n: int, start: int, end: int, fallback: str) -> str:
    """
    Safe byte slice -> utf8 string. If no data is given, just return the fallback string.
    """
    if data is None:
        return fallback
    start = max(0, start)
    end = min(n, end)
    return data[start:end].decode("utf-8", errors="replace")


# Patterns to recognise decode calls inside the window.
# We will re-match them inside each snippet.
DECODE_PATTERNS = [
    # atob(payload)
    (re.compile(r"atob\(([^)]*)\)"),                  "atob"),
    # Buffer.from(payload, "base64")
    (re.compile(r"Buffer\.from\(([^,]+),\s*(['\"][^'\"]+['\"])"), "Buffer.from"),
    # Base64.decode(payload[, fmt])
    (re.compile(r"Base64\.decode\(([^,)]*)(?:,\s*(['\"][^'\"]+['\"]))?"), "Base64.decode"),
    # Custom base64Decoder(payload)
    (re.compile(r"base64Decoder\(([^)]*)\)"),         "base64Decoder"),
]


def classify_arg(arg_text: str, fmt_literal: str | None):
    """
    Return (kind, literal_value_or_None, format_str_or_None).

    kind: "STRING" if argument is a quoted literal, otherwise "VAR".
    """
    arg_text = arg_text.strip()

    # string literal?
    m = re.match(r"""^(['"])(.*)\1$""", arg_text)
    if m:
        literal = m.group(2)
        fmt = None
        if fmt_literal:
            # fmt_literal still includes quotes, strip them
            fm = re.match(r"""^(['"])(.*)\1$""", fmt_literal.strip())
            fmt = fm.group(2) if fm else fmt_literal
        else:
            # fall back: if we see 'base64' inside the call, assume base64
            if "base64" in arg_text.lower():
                fmt = "base64"
        return ("STRING", literal, fmt)
    else:
        fmt = None
        if fmt_literal:
            fm = re.match(r"""^(['"])(.*)\1$""", fmt_literal.strip())
            fmt = fm.group(2) if fm else fmt_literal
        return ("VAR", None, fmt)


def main():
    if len(sys.argv) < 2:
        print(USAGE, file=sys.stderr)
        sys.exit(1)

    hits_path = sys.argv[1]
    source_path = sys.argv[2] if len(sys.argv) >= 3 else None

    label = get_label(hits_path)
    counts_out = f"{FEATURE_ID}_hits_{label}"
    detail_out = f"{FEATURE_ID}_2_{label}"

    data, n = load_source_bytes(source_path)

    # Collections
    decode_from_str = []  # STRING literal decodes
    decode_from_var = []  # VAR / expression / UNKNOWN decodes

    # Parse hits file
    with open(hits_path, "r", encoding="utf-8", errors="ignore") as hits:
        for raw in hits:
            line = raw.strip()
            if not line:
                continue

            # A2 lines look like:  2:212292:atob(
            parts = line.split(":", 2)
            if len(parts) < 3:
                continue

            _, off_str, frag = parts
            try:
                offset = int(off_str)
            except ValueError:
                continue

            # Take a local window around the hit to re-parse the call
            snippet = window(data, n, offset - 80, offset + 220, fallback=frag)
            matched = False

            for regex, func_name in DECODE_PATTERNS:
                m = regex.search(snippet)
                if not m:
                    continue
                matched = True
                arg_text = m.group(1)
                fmt_literal = m.group(2) if m.lastindex and m.lastindex >= 2 else None

                kind, literal, fmt = classify_arg(arg_text, fmt_literal)
                entry = {
                    "offset": offset,
                    "func": func_name,
                    "kind": kind,           # "STRING" or "VAR"
                    "arg_text": arg_text.strip(),
                    "literal": literal,     # only if STRING
                    "format": fmt,          # may be None
                    "snippet": snippet,
                }

                if kind == "STRING":
                    decode_from_str.append(entry)
                else:
                    decode_from_var.append(entry)
                break

            if not matched:
                # couldn't re-parse; treat as variable decode with context only
                entry = {
                    "offset": offset,
                    "func": "UNKNOWN",
                    "kind": "UNKNOWN",
                    "arg_text": "",
                    "literal": None,
                    "format": None,
                    "snippet": snippet,
                }
                decode_from_var.append(entry)

    total_sites = len(decode_from_str) + len(decode_from_var)

    # ---------- 1) Counts file ----------
    with open(counts_out, "w", encoding="utf-8") as out:
        out.write(f"{FEATURE_ID}_total_sites: {total_sites}\n")
        out.write(f"{FEATURE_ID}_decode_string_literal: {len(decode_from_str)}\n")
        out.write(f"{FEATURE_ID}_decode_variable: {len(decode_from_var)}\n")

    # ---------- 2) Summary + details ----------
    with open(detail_out, "w", encoding="utf-8") as out:
        out.write("===========================================\n")
        out.write("   A2 Base64 Decode – Layer 2 Summary\n")
        out.write("===========================================\n\n")

        out.write(f"Source hits file : {hits_path}\n")
        out.write(f"Source code file: {source_path or 'N/A'}\n\n")

        out.write("[Summary]\n")
        out.write(f"A2_total_sites: {total_sites}\n")
        out.write(f"A2_decode_string_literal: {len(decode_from_str)}\n")
        out.write(f"A2_decode_variable: {len(decode_from_var)}\n\n")

        out.write("[Details]\n")
        out.write(f"target_label: {label}\n")
        out.write(f"arg1(hits_file): {hits_path}\n")
        out.write(f"arg2(source_file): {source_path or 'N/A'}\n\n")

        out.write("----- Decode from STRING literals -----\n\n")
        for e in decode_from_str:
            out.write(f"offset={e['offset']} func={e['func']}\n")
            out.write(f"  literal: \"{e['literal']}\"\n")
            out.write(f"  format:  {e['format']}\n")
            out.write(f"  arg:     {e['arg_text']}\n\n")

        out.write("----- Decode from VAR / expression (for reference) -----\n\n")
        for e in decode_from_var:
            out.write(f"offset={e['offset']} func={e['func']} kind={e['kind']}\n")
            out.write(f"  arg: {e['arg_text']}\n")
            preview = e["snippet"].replace("\n", " ")
            if len(preview) > 180:
                preview = preview[:180] + "..."
            out.write(f"  context: {preview}\n\n")

    print(f"[+] {FEATURE_ID} counts written to {counts_out}")
    print(f"[+] {FEATURE_ID} summary written to {detail_out}")


if __name__ == "__main__":
    main()


