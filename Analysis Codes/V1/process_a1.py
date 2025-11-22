#!/usr/bin/env python3
import sys
import re

"""
process_A1.py

Usage:
    python3 process_A1.py bundle_flow.js static_features/A1_extraction_XXX

Output:
    A1_2   - summary and detailed function calls

Classifies exec/eval into 6 buckets:
  command_literal
  command_variable
  command_url
  dynamic_literal
  dynamic_variable
  dynamic_url
"""

if len(sys.argv) != 3:
    print("Usage: python3 process_A1.py <segmented_file> <A1_extraction_file>")
    sys.exit(1)

source_path = sys.argv[1]
hits_path   = sys.argv[2]
output_path = "A1_2"

# Load full source file (segmented or original)
with open(source_path, "rb") as f:
    data = f.read()
n = len(data)

def safe_slice(start, end):
    start = max(0, start)
    end   = min(n, end)
    return data[start:end].decode("utf-8", errors="replace")

def find_matching_paren(start):
    """
    Given index of '(' return index of matching ')'
    """
    depth = 0
    for i in range(start, len(data)):
        b = data[i]
        if b == ord("("):
            depth += 1
        elif b == ord(")"):
            depth -= 1
            if depth == 0:
                return i
    return None

def classify_arg(arg):
    t = arg.strip()

    # URL check first (strong indicator)
    if "http://" in t or "https://" in t:
        return "url"

    # literal?
    if (t.startswith('"') and t.endswith('"')) or \
       (t.startswith("'") and t.endswith("'")) or \
       (t.startswith("`") and t.endswith("`")):
        return "literal"

    return "variable"


# The 6 counters
counts = {
    "command_literal": 0,
    "command_variable": 0,
    "command_url": 0,
    "dynamic_literal": 0,
    "dynamic_variable": 0,
    "dynamic_url": 0
}

# Store detailed hits
details = []

with open(hits_path, "r", encoding="utf-8", errors="ignore") as f:
    for raw in f:
        line = raw.strip()
        if not line:
            continue

        parts = line.split(":", 2)
        if len(parts) < 3:
            continue

        _, off_str, match_text = parts
        try:
            offset = int(off_str)
        except:
            continue

        # Determine type: command or dynamic
        lower = match_text.lower()

        if "child_process." in lower and ("exec" in lower or "spawn" in lower or "fork" in lower):
            kind = "command"
            keyword = match_text.strip()
        elif lower.startswith("eval(") or "eval(" in lower:
            kind = "dynamic"
            keyword = "eval"
        elif "new function(" in lower:
            kind = "dynamic"
            keyword = "new Function"
        else:
            continue

        # Now find the real call site
        func_start = data.find(match_text.encode(), offset - 20, offset + 200)
        if func_start == -1:
            func_start = offset

        # Find '(' after match_text
        open_paren = data.find(b"(", func_start)
        if open_paren == -1:
            continue

        close_paren = find_matching_paren(open_paren)
        if close_paren is None:
            continue

        call = safe_slice(func_start, close_paren + 1)
        arg = safe_slice(open_paren + 1, close_paren)

        arg_type = classify_arg(arg)

        # Assign category
        category = f"{kind}_{arg_type}"
        counts[category] += 1

        details.append({
            "offset": offset,
            "kind": kind,
            "category": category,
            "call": call,
            "arg": arg
        })


# Write A1_2
with open(output_path, "w", encoding="utf-8") as out:
    out.write("========================================\n")
    out.write("        A1 – Execution Summary\n")
    out.write("========================================\n\n")

    for k in [
        "command_literal",
        "command_variable",
        "command_url",
        "dynamic_literal",
        "dynamic_variable",
        "dynamic_url"
    ]:
        out.write(f"{k}: {counts[k]}\n")
    out.write("\n\n")

    out.write("========================================\n")
    out.write("          Detailed Call Sites\n")
    out.write("========================================\n\n")

    for d in details:
        out.write(f"offset={d['offset']} category={d['category']}\n")
        out.write(f"call: {d['call']}\n")
        out.write(f"arg : {d['arg']}\n")
        out.write("----------------------------------------\n\n")

print(f"[+] A1_2 written to {output_path}")


