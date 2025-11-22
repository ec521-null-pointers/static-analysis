#!/usr/bin/env python3
import sys
import re
from collections import defaultdict

def usage():
    print("Usage: python3 analyze_A3.py bundle.js A3", file=sys.stderr)
    sys.exit(1)

if len(sys.argv) != 3:
    usage()

bundle_path = sys.argv[1]
hits_path   = sys.argv[2]
output_path = "A3_2"   # final processed output

# --------------------------------------------------------------------
# Load bundle as bytes so offsets from rg --byte-offset are correct
# --------------------------------------------------------------------
with open(bundle_path, "rb") as f:
    data = f.read()
n = len(data)

def slice_chars(start, end):
    """Safe byte slice -> utf8 string."""
    start = max(0, start)
    end   = min(n, end)
    return data[start:end].decode("utf-8", errors="replace")

# --------------------------------------------------------------------
# Step 1+2: Build structured entries from hits (base64Encoder / toString("base64"))
# --------------------------------------------------------------------
entries = []  # each entry will be dict: {offset, kind, text}

with open(hits_path, "r", encoding="utf-8", errors="ignore") as hits:
    for line in hits:
        line = line.strip()
        if not line:
            continue

        # A3 lines look like:  LINE:OFFSET:FRAGMENT
        parts = line.split(":", 2)
        if len(parts) < 3:
            continue
        _, off_str, frag = parts
        try:
            offset = int(off_str)
        except ValueError:
            continue

        frag = frag.strip()

        # CASE 1: base64Encoder(...)
        if "base64Encoder" in frag:
            name_bytes = b"base64Encoder"
            call_start = data.find(name_bytes, offset)
            if call_start == -1:
                # fallback: just show some context
                ctx = slice_chars(offset - 80, offset + 80)
                text = f"offset={offset} kind=base64Encoder context={ctx}"
                entries.append({
                    "offset": offset,
                    "kind": "base64Encoder",
                    "text": text,
                })
                continue

            open_paren = data.find(b"(", call_start + len(name_bytes))
            if open_paren == -1:
                ctx = slice_chars(call_start, call_start + 160)
                text = f"offset={offset} kind=base64Encoder context={ctx}"
                entries.append({
                    "offset": offset,
                    "kind": "base64Encoder",
                    "text": text,
                })
                continue

            # match parentheses to find the end of the call
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
                ctx = slice_chars(call_start, call_start + 200)
                text = f"offset={offset} kind=base64Encoder context={ctx}"
                entries.append({
                    "offset": offset,
                    "kind": "base64Encoder",
                    "text": text,
                })
            else:
                arg     = slice_chars(open_paren + 1, end_paren).strip()
                snippet = slice_chars(call_start, end_paren + 1)
                text = (
                    f"offset={offset} kind=base64Encoder\n"
                    f"  call:   {snippet}\n"
                    f"  arg:    {arg}\n"
                )
                entries.append({
                    "offset": offset,
                    "kind": "base64Encoder",
                    "text": text,
                })

        # CASE 2: something.toString("base64")
        else:
            # here the encoded value is the expression BEFORE ".toString"
            ctx = slice_chars(offset - 120, offset + 80)
            text = (
                f"offset={offset} kind=toString_base64\n"
                f"  context: {ctx}\n"
            )
            entries.append({
                "offset": offset,
                "kind": "toString_base64",
                "text": text,
            })

# --------------------------------------------------------------------
# Step 3: Classify each entry (SECRETS / CONFIG_OR_URL / LOG_OR_MESSAGE / OTHER)
# --------------------------------------------------------------------

# simple keyword sets for categories (case-insensitive)
SECRET_WORDS = [
    "secret", "token", "credential", "password", "passphrase",
    "auth", "authorization", "bearer", "access_key", "secret_key",
    "npm_token", "github_token", "aws_access_key_id", "aws_secret_access_key",
]

LOG_WORDS = [
    "log(", "logger", "logging", "trace",
    "debug", "info", "warn", "error", "message",
]

CONFIG_WORDS = [
    "http://", "https://", "url", ".json", "config", "endpoint", "uri",
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

buckets = defaultdict(list)
for e in entries:
    cat = classify(e["text"])
    e["category"] = cat
    buckets[cat].append(e)

total = len(entries)

# --------------------------------------------------------------------
# Final output: A3_2 (summary + suspicious entries)
# --------------------------------------------------------------------
with open(output_path, "w", encoding="utf-8") as out:
    out.write("===========================================\n")
    out.write("   A3 base64 Encoding – Final Summary\n")
    out.write("===========================================\n\n")
    out.write(f"Bundle file:           {bundle_path}\n")
    out.write(f"Hits file (rg output): {hits_path}\n\n")
    out.write(f"Total base64 encode sites: {total}\n")

    for cat in ["SECRETS", "CONFIG_OR_URL", "LOG_OR_MESSAGE", "OTHER"]:
        out.write(f"{cat}: {len(buckets[cat])}\n")
    out.write("\n")

    # dump suspicious ones with some detail
    for cat in ["SECRETS", "CONFIG_OR_URL"]:
        out.write(f"===== {cat} (count={len(buckets[cat])}) =====\n\n")
        for e in buckets[cat]:
            out.write(
                f"offset={e.get('offset')} kind={e.get('kind')} "
                f"category={e['category']}\n"
            )
            out.write(e.get("text", "") + "\n\n")

print(f"[+] Wrote final A3 summary to {output_path}")

