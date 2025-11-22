#!/usr/bin/env python3
import sys
import re

if len(sys.argv) != 3:
    print("Usage: python3 analyze_A2.py bundle.js A2", file=sys.stderr)
    sys.exit(1)

bundle_path = sys.argv[1]
hits_path   = sys.argv[2]
output_path = "A2_2"

# Read bundle as bytes so byte-offsets from rg are correct
with open(bundle_path, "rb") as f:
    data = f.read()
n = len(data)

def window(start, end):
    start = max(0, start)
    end   = min(n, end)
    return data[start:end].decode("utf-8", errors="replace")

# Patterns to recognise decode calls inside the window
# We will re-match them inside each snippet
DECODE_PATTERNS = [
    # atob(payload)
    (re.compile(r"atob\(([^)]*)\)"),                    "atob"),

    # Buffer.from(payload, "base64")
    (re.compile(r"Buffer\.from\(([^,]+),\s*(['\"][^'\"]+['\"])"), "Buffer.from"),

    # Base64.decode(payload[, fmt])
    (re.compile(r"Base64\.decode\(([^,)]*)(?:,\s*(['\"][^'\"]+['\"]))?"), "Base64.decode"),

    # Custom base64Decoder(payload)
    (re.compile(r"base64Decoder\(([^)]*)\)"),           "base64Decoder"),
]

def classify_arg(arg_text, fmt_literal):
    """Return (kind, literal_value_or_None, format_str_or_None)."""
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

# Counters & collections
decode_from_str = []
decode_from_var = []

with open(hits_path, "r") as hits:
    for line in hits:
        line = line.strip()
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

        # take a local window around the hit to re-parse the call
        snippet = window(offset - 80, offset + 220)

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
                "kind": kind,               # "STRING" or "VAR"
                "arg_text": arg_text.strip(),
                "literal": literal,         # only if STRING
                "format": fmt,              # may be None
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

# Write A2_2
with open(output_path, "w") as out:
    out.write("===========================================\n")
    out.write("   A2 Base64 Decode – Layer 2 Summary\n")
    out.write("===========================================\n\n")

    out.write(f"Total decode sites: {len(decode_from_str) + len(decode_from_var)}\n")
    out.write(f"Decode from STRING literals: {len(decode_from_str)}\n")
    out.write(f"Decode from VAR / expression: {len(decode_from_var)}\n\n")

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
        # optionally include a very short preview of snippet
        preview = e["snippet"].replace("\n", " ")
        if len(preview) > 180:
            preview = preview[:180] + "..."
        out.write(f"  context: {preview}\n\n")

print(f"Wrote A2 layer-2 summary to {output_path}")

