#!/usr/bin/env python3
import re
import sys
from collections import defaultdict

"""
B2_2: Layer-2 processing for token flows / token validation.

Input:
  B2  - text file of raw lines from rg/semgrep that show token-related usage
        (e.g. OAuth flows, token validation, "invalid npm token", etc.)

Output:
  B2_2 - human-readable summary with:
    - total_events
    - number of providers (N_providers)
    - list of providers
    - counts per provider
    - counts per flow type (VALIDATE / EXCHANGE / PUBLISH / OTHER)
    - example lines grouped by provider
"""

if len(sys.argv) != 2:
    print("Usage: python3 analyze_B2.py B2", file=sys.stderr)
    sys.exit(1)

input_path = sys.argv[1]
output_path = "B2_2"

# ---------- Provider classification rules ----------
PROVIDER_RULES = {
    "AWS":    r"aws|sts\.amazonaws\.com|aws_",
    "GCP":    r"googleapis\.com|oauth2|google\.com|GOOGLE_",
    "GitHub": r"github\.com|GITHUB_",
    "npm":    r"npmjs\.org|npmjs\.com|\bnpm\b|NPM_TOKEN",
    "GitLab": r"gitlab\.com|GITLAB_",
    "Azure":  r"microsoftonline\.com|login\.windows\.net|AZURE_|AZ_",
}

DEFAULT_PROVIDER = "Unknown"


def classify_provider(text: str) -> str:
    t = text.lower()
    for provider, pattern in PROVIDER_RULES.items():
        if re.search(pattern, t):
            return provider
    return DEFAULT_PROVIDER


def classify_flow_type(text: str) -> str:
    """
    Rough classification of token-related behavior:
      VALIDATE: validation / verification of tokens
      EXCHANGE: OAuth/token exchange / refresh flows
      PUBLISH : behavior around npm publish / login / adduser
      OTHER   : anything else
    """
    t = text.lower()

    # validation / verification
    if re.search(r"validate|verification|verifyidtoken|jwt\.verify|token.*invalid|invalid.*token", t):
        return "VALIDATE"

    # token exchange / refresh
    if "token" in t and re.search(r"oauth|grant_type|exchange|refresh|id_token|access_token", t):
        return "EXCHANGE"

    # npm publish / login / adduser
    if re.search(r"\bnpm\b.*(publish|adduser|login|token)", t):
        return "PUBLISH"

    return "OTHER"


# ---------- Parse B2 ----------
events = []  # each event is a dict: {line_no, provider, flow_type, raw}
provider_buckets = defaultdict(list)
flow_buckets = defaultdict(list)

with open(input_path, "r", encoding="utf-8", errors="replace") as f:
    for idx, line in enumerate(f, start=1):
        raw = line.rstrip("\n")
        if not raw.strip():
            continue

        provider = classify_provider(raw)
        flow_type = classify_flow_type(raw)

        event = {
            "line_no": idx,
            "provider": provider,
            "flow_type": flow_type,
            "raw": raw,
        }
        events.append(event)
        provider_buckets[provider].append(event)
        flow_buckets[flow_type].append(event)

# ---------- Write B2_2 ----------
with open(output_path, "w", encoding="utf-8") as out:
    out.write("===========================================\n")
    out.write("   B2 Token Flows / Validation – Layer 2\n")
    out.write("===========================================\n\n")

    out.write(f"Total token-related events: {len(events)}\n")
    out.write(f"Total providers (N_providers): {len(provider_buckets.keys())}\n\n")

    # Providers list
    out.write("Providers detected:\n")
    for p in provider_buckets:
        out.write(f" - {p}  (events: {len(provider_buckets[p])})\n")
    out.write("\n")

    # Flow-type counts
    out.write("Flow types:\n")
    for ft in ["VALIDATE", "EXCHANGE", "PUBLISH", "OTHER"]:
        out.write(f" - {ft}: {len(flow_buckets[ft])}\n")
    out.write("\n")

    # Detailed listing per provider (short)
    for p, ev_list in provider_buckets.items():
        out.write(f"===== Provider: {p} (events={len(ev_list)}) =====\n\n")
        for e in ev_list:
            out.write(f"[line {e['line_no']}] type={e['flow_type']}\n")
            out.write(f"  {e['raw']}\n\n")

print(f"Wrote B2 layer-2 summary to: {output_path}")
