#!/usr/bin/env python3
import sys
import os
import re

FEATURE_ID = "A1"

USAGE = f"Usage: python3 process_{FEATURE_ID}.py <A1_hits_file> <source_js_file>"


def get_label(hits_path: str) -> str:
    """
    Strip leading 'A1_' from basename to get a per-file label.
    Example:
        A1_home--...--bundle_flow.js -> home--...--bundle_flow.js
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


def safe_slice(data: bytes | None, n: int, start: int, end: int, fallback: str = "") -> str:
    if data is None:
        return fallback
    start = max(0, start)
    end = min(n, end)
    return data[start:end].decode("utf-8", errors="replace")


def find_matching_paren(data: bytes, open_idx: int) -> int | None:
    """
    Given index of '(' in data, return index of matching ')', or None.
    """
    depth = 0
    for i in range(open_idx, len(data)):
        b = data[i]
        if b == ord("("):
            depth += 1
        elif b == ord(")"):
            depth -= 1
            if depth == 0:
                return i
    return None


def classify_arg(arg: str) -> str:
    t = arg.strip()
    # URL check first (strong indicator)
    if "http://" in t or "https://" in t:
        return "url"
    # string literal?
    if (t.startswith('"') and t.endswith('"')) or \
       (t.startswith("'") and t.endswith("'")) or \
       (t.startswith("`") and t.endswith("`")):
        return "literal"
    return "variable"


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

    # Initialize all 6 buckets to 0
    counts = {
        "command_literal": 0,
        "command_variable": 0,
        "command_url": 0,
        "dynamic_literal": 0,
        "dynamic_variable": 0,
        "dynamic_url": 0,
    }

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
            except ValueError:
                continue

            lower = match_text.lower()

            # Decide whether it's command or dynamic execution
            if "child_process." in lower and any(k in lower for k in ["exec", "spawn", "fork"]):
                kind = "command"
            elif "eval(" in lower:
                kind = "dynamic"
            elif "new function(" in lower:
                kind = "dynamic"
            else:
                # Unknown pattern; skip
                continue

            if data is not None:
                # Locate the call in the source bytes
                mbytes = match_text.encode()
                func_start = data.find(mbytes, max(0, offset - 50), min(n, offset + 300))
                if func_start == -1:
                    func_start = offset

                # Find '(' after the match
                open_paren = data.find(b"(", func_start)
                if open_paren == -1:
                    continue

                close_paren = find_matching_paren(data, open_paren)
                if close_paren is None:
                    continue

                call = safe_slice(data, n, func_start, close_paren + 1, fallback=match_text)
                arg = safe_slice(data, n, open_paren + 1, close_paren, fallback="")
            else:
                # No source file given; we can only record the match text
                call = match_text
                arg = ""

            arg_type = classify_arg(arg)
            category = f"{kind}_{arg_type}"

            # Make sure category exists (defensive; should always be true)
            if category not in counts:
                counts[category] = 0
            counts[category] += 1

            details.append({
                "offset": offset,
                "kind": kind,
                "category": category,
                "call": call,
                "arg": arg,
            })

    total_sites = sum(counts.values())

    # ---------- 1) Counts file ----------
    with open(counts_out, "w", encoding="utf-8") as out:
        out.write(f"{FEATURE_ID}_total_sites: {total_sites}\n")
        out.write(f"{FEATURE_ID}_command_literal: {counts['command_literal']}\n")
        out.write(f"{FEATURE_ID}_command_variable: {counts['command_variable']}\n")
        out.write(f"{FEATURE_ID}_command_url: {counts['command_url']}\n")
        out.write(f"{FEATURE_ID}_dynamic_literal: {counts['dynamic_literal']}\n")
        out.write(f"{FEATURE_ID}_dynamic_variable: {counts['dynamic_variable']}\n")
        out.write(f"{FEATURE_ID}_dynamic_url: {counts['dynamic_url']}\n")

    # ---------- 2) Summary + details ----------
    with open(detail_out, "w", encoding="utf-8") as out:
        out.write("========================================\n")
        out.write("        A1 – Execution Summary\n")
        out.write("========================================\n\n")

        out.write(f"Source hits file : {hits_path}\n")
        out.write(f"Source code file: {source_path or 'N/A'}\n\n")

        out.write("[Summary]\n")
        out.write(f"A1_total_sites: {total_sites}\n")
        out.write(f"A1_command_literal: {counts['command_literal']}\n")
        out.write(f"A1_command_variable: {counts['command_variable']}\n")
        out.write(f"A1_command_url: {counts['command_url']}\n")
        out.write(f"A1_dynamic_literal: {counts['dynamic_literal']}\n")
        out.write(f"A1_dynamic_variable: {counts['dynamic_variable']}\n")
        out.write(f"A1_dynamic_url: {counts['dynamic_url']}\n\n")

        out.write("[Details]\n")
        out.write(f"target_label: {label}\n")
        out.write(f"arg1(hits_file): {hits_path}\n")
        out.write(f"arg2(source_file): {source_path or 'N/A'}\n\n")

        out.write("----- Detailed Call Sites -----\n\n")
        for d in details:
            out.write(f"offset={d['offset']} category={d['category']}\n")
            out.write(f"call: {d['call']}\n")
            out.write(f"arg : {d['arg']}\n")
            out.write("----------------------------------------\n\n")

    print(f"[+] {FEATURE_ID} counts written to {counts_out}")
    print(f"[+] {FEATURE_ID} summary written to {detail_out}")


if __name__ == "__main__":
    main()


