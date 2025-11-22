#!/usr/bin/env python3
import sys
import os
from collections import defaultdict, Counter

FEATURE_ID = "D1"

USAGE = f"Usage: python3 process_{FEATURE_ID}.py <D1_hits_file> [source_js_file]"


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


def get_label(hits_path: str) -> str:
    """
    Strip leading 'D1_' from basename to get a per-file label.

    Example:
        D1_home--...--bundle_flow.js -> home--...--bundle_flow.js
    """
    base = os.path.basename(hits_path)
    prefix = FEATURE_ID + "_"
    if base.startswith(prefix):
        return base[len(prefix):]
    return base


def main():
    if len(sys.argv) < 2:
        print(USAGE, file=sys.stderr)
        sys.exit(1)

    input_path = sys.argv[1]
    source_path = sys.argv[2] if len(sys.argv) >= 3 else None

    if not os.path.exists(input_path):
        print(f"Error: file not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    label = get_label(input_path)
    counts_out = f"{FEATURE_ID}_hits_{label}"
    detail_out = f"{FEATURE_ID}_2_{label}"

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

    total_hits = len(hits)

    # Helper: ecosystems that do a given action
    def ecos_for(action):
        return sorted([e for e, acts in ecosystem_to_actions.items() if action in acts])

    # Ensure auth / push / publish keys exist
    for key in ["auth", "push", "publish"]:
        if key not in action_counts:
            action_counts[key] = 0

    # ------------------------------------
    # 1) Counts file: D1_hits_<label>
    # ------------------------------------
    with open(counts_out, "w", encoding="utf-8") as out:
        out.write(f"{FEATURE_ID}_total_hits: {total_hits}\n")
        # Ecosystem-level summary (how many lines touch each ecosystem)
        for ecosys in sorted(KNOWN_ECOSYSTEMS):
            out.write(f"{FEATURE_ID}_ecosystem_{ecosys}: {ecosystem_counts.get(ecosys, 0)}\n")
        # Focused actions: auth / push / publish (independent features)
        out.write(f"{FEATURE_ID}_auth: {action_counts.get('auth', 0)}\n")
        out.write(f"{FEATURE_ID}_push: {action_counts.get('push', 0)}\n")
        out.write(f"{FEATURE_ID}_publish: {action_counts.get('publish', 0)}\n")

    # ------------------------------------
    # 2) Summary + details: D1_2_<label>
    # ------------------------------------
    with open(detail_out, "w", encoding="utf-8") as out:
        out.write("===========================================\n")
        out.write("   D1 Supply-Chain Publish/Auth/Push\n")
        out.write("===========================================\n\n")

        out.write(f"Source hits file : {input_path}\n")
        out.write(f"Source code file:  {source_path or 'N/A'}\n\n")

        # Summary block
        out.write("[Summary]\n")
        out.write(f"D1_total_hits: {total_hits}\n")

        out.write("\nEcosystem hit counts:\n")
        for ecosys in sorted(ecosystem_counts.keys()):
            out.write(f"- {ecosys}: {ecosystem_counts[ecosys]}\n")

        out.write("\nAction hit counts:\n")
        # print all known actions so you can see non-zero ones
        for action in sorted(KNOWN_ACTIONS):
            out.write(f"- {action}: {action_counts.get(action, 0)}\n")

        out.write("\nFocused actions:\n")
        for action in ["auth", "push", "publish"]:
            ecos = ecos_for(action)
            out.write(f"== {action.upper()} ==\n")
            out.write(f"ecosystems_with_{action}: {len(ecos)}\n")
            if ecos:
                out.write("  - " + ", ".join(ecos) + "\n")
            out.write("\n")

        # Details block
        out.write("[Details]\n")
        out.write(f"target_label: {label}\n")
        out.write(f"arg1(hits_file): {input_path}\n")
        out.write(f"arg2(source_file): {source_path or 'N/A'}\n\n")

        out.write("== Detailed hits ==\n")
        for h in hits:
            out.write(
                f"- line {h['line']}, offset {h['offset']}, "
                f"ecosystem={h['ecosystem']}, action={h['action']}, "
                f'text="{h["raw"]}"\n'
            )

    print(f"[+] {FEATURE_ID} counts written to {counts_out}")
    print(f"[+] {FEATURE_ID} summary written to {detail_out}")


if __name__ == "__main__":
    main()


