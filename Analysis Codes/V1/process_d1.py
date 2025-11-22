#!/usr/bin/env python3
import sys
from collections import defaultdict, Counter

"""
Analyze D1 (multi-ecosystem publish/auth/push commands)

Usage:
    python3 analyze_D1.py static_features/D1

Input (D1):
    Lines like:
        30559:1085906:git push
        44032:1485371:npm publish
        97128:3432087:gh auth

Output:
    D1_2  - summary file in the CURRENT directory (not inside static_features/)
"""

if len(sys.argv) != 2:
    print("Usage: python3 analyze_D1.py static_features/D1", file=sys.stderr)
    sys.exit(1)

input_path = sys.argv[1]
output_path = "D1_2"   # ← now matches other scripts (no static_features/ prefix)

# tools / ecosystems we care about
KNOWN_ECOSYSTEMS = {
    "npm", "yarn", "pnpm", "bun",
    "poetry", "pip", "flit",
    "cargo", "go", "mvn", "gradle",
    "docker", "podman",
    "dotnet", "nuget",
    "gh", "git",
}

# actions we care about (will still record others)
KNOWN_ACTIONS = {
    "publish", "adduser", "login", "token",
    "push", "upload", "release",
    "credentials", "credential",
    "auth", "authorize", "authentication",
}

hits = []
ecosystem_to_actions = defaultdict(set)
ecosystem_counts = Counter()
action_counts = Counter()

with open(input_path, "r", encoding="utf-8") as f:
    for raw in f:
        line = raw.strip()
        if not line:
            continue

        # Format: LINE:OFFSET:TEXT...
        try:
            line_no_str, offset_str, text = line.split(":", 2)
        except ValueError:
            # unexpected format, skip
            continue

        try:
            line_no = int(line_no_str)
            offset = int(offset_str)
        except ValueError:
            continue

        txt = text.strip()
        parts = txt.split()
        if not parts:
            continue

        ecosys = parts[0]
        action = parts[-1]

        # Normalize to lowercase
        ecosys_l = ecosys.lower()
        action_l = action.lower()

        hits.append({
            "line": line_no,
            "offset": offset,
            "ecosystem": ecosys_l,
            "action": action_l,
            "raw": txt,
        })

        # count ecosystems/actions we know about
        if ecosys_l in KNOWN_ECOSYSTEMS:
            ecosystem_counts[ecosys_l] += 1
        if action_l in KNOWN_ACTIONS:
            action_counts[action_l] += 1

        if ecosys_l in KNOWN_ECOSYSTEMS and action_l in KNOWN_ACTIONS:
            ecosystem_to_actions[ecosys_l].add(action_l)


# Helper: ecosystems that do a given action
def ecos_for(action):
    return sorted([e for e, acts in ecosystem_to_actions.items() if action in acts])


with open(output_path, "w", encoding="utf-8") as out:
    out.write(f"source_file: {input_path}\n")
    out.write(f"total_hits: {len(hits)}\n\n")

    out.write("== Ecosystem hit counts ==\n")
    for ecosys, cnt in sorted(ecosystem_counts.items()):
        out.write(f"- {ecosys}: {cnt}\n")
    out.write("\n")

    out.write("== Action hit counts ==\n")
    # ensure auth / push / publish always appear, even if 0
    for key in ["auth", "push", "publish"]:
        if key not in action_counts:
            action_counts[key] = 0
    for action, cnt in sorted(action_counts.items()):
        out.write(f"- {action}: {cnt}\n")
    out.write("\n")

    # Focused summary for auth / push / publish
    for action in ["auth", "push", "publish"]:
        ecos = ecos_for(action)
        out.write(f"== {action.upper()} ==\n")
        out.write(f"ecosystems_with_{action}: {len(ecos)}\n")
        if ecos:
            out.write("  - " + ", ".join(ecos) + "\n")
        out.write("\n")

    out.write("== Detailed hits ==\n")
    for h in hits:
        out.write(
            f"- line {h['line']}, offset {h['offset']}, "
            f"ecosystem={h['ecosystem']}, action={h['action']}, "
            f'text="{h["raw"]}"\n'
        )

print(f"[+] Wrote D1 layer-2 summary to {output_path}")


