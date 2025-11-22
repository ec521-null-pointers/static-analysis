#!/usr/bin/env python3
import sys
import re

USAGE = "Usage: python3 analyze_C2.py static_features/C2 > static_features/C2_classes"

# Categories:
# - sink_exfil: endpoints commonly used as data sinks / collectors
# - dev_code_host: code/content hosts devs use (raw GH, gists)
# - cloud_auth: cloud identity / token endpoints (AWS/GCP/Azure)
# - other_suspicious: fallback bucket if nothing matches above

CATEGORY_PATTERNS = [
    # Data sinks / exfil collectors
    (
        "sink_exfil",
        re.compile(
            r"(webhook\.site|requestbin|ngrok\.io|discord\.com/api/webhooks|pastebin\.com)",
            re.IGNORECASE,
        ),
    ),
    # Developer-oriented hosting (raw code / gists)
    (
        "dev_code_host",
        re.compile(
            r"(raw\.githubusercontent\.com|gist\.github\.com)",
            re.IGNORECASE,
        ),
    ),
    # Cloud auth / token / identity endpoints
    (
        "cloud_auth",
        re.compile(
            r"(sts\.amazonaws\.com|signin\.aws\.amazon\.com|accounts\.google\.com|"
            r"login\.microsoftonline\.com|graph\.microsoft\.com)",
            re.IGNORECASE,
        ),
    ),
]

def classify_line(line: str) -> str:
    """
    Classify a single C2 hit line into exactly one category.
    First matching category wins. If none match, returns 'other_suspicious'.
    """
    for category, pattern in CATEGORY_PATTERNS:
        if pattern.search(line):
            return category
    return "other_suspicious"


def main():
    if len(sys.argv) != 2:
        print(USAGE, file=sys.stderr)
        sys.exit(1)

    input_path = sys.argv[1]

    try:
        with open(input_path, "r", encoding="utf-8", errors="replace") as f:
            for raw_line in f:
                line = raw_line.rstrip("\n")
                category = classify_line(line)
                # Ensure exactly one classification per hit (per line):
                # we stop at the first matching category in classify_line().
                print(f"{category}\t{line}")
    except FileNotFoundError:
        print(f"Error: file not found: {input_path}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

