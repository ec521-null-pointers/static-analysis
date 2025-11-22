#!/usr/bin/env python3
import sys

"""
Analyze D2 (install + publish hooks)

Usage:
    python3 analyze_D2.py static_features/D2

Input (D2):
    Lines like: LINE:OFFSET:"install":
    (produced by your rg command on package.json)

Output:
    D2_2  - summary with per-hook counts
"""

# Full hook list (including optional)
LIFECYCLE_HOOKS = [
    "preinstall", "install", "postinstall",
    "prepare",
    "prepack", "postpack",
    "preversion", "version", "postversion",
    "prepublish", "prepublishOnly", "publish", "postpublish",
    "pretest", "test", "posttest",
    "prerestart", "restart", "postrestart",
    "prebuild", "build", "postbuild",
]

OPTIONAL_HOOKS = {
    "pretest", "test", "posttest",
    "prebuild", "build", "postbuild",
    "prerestart", "restart", "postrestart",
}


def analyze_d2(path):
    # totals
    counts = {
        "total_hooks": 0,
        "total_optional_hooks": 0,
        "optional_dependencies": 0,
        "scripts_block": 0,
    }

    # per-hook counter
    hook_counts = {h: 0 for h in LIFECYCLE_HOOKS}

    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        for raw in f:
            line = raw.strip()
            if not line:
                continue

            # D2 lines look like: "LINE:OFFSET:\"install\":"
            # We'll just search the text portion.
            # If your file is "LINE:OFFSET:TEXT", split off the TEXT:
            parts = line.split(":", 2)
            if len(parts) == 3:
                _, _, text = parts
            else:
                # fall back to whole line if format is different
                text = line

            # 1 ▶️ lifecycle hooks
            for hook in LIFECYCLE_HOOKS:
                if f'"{hook}"' in text or f"'{hook}'" in text:
                    counts["total_hooks"] += 1
                    hook_counts[hook] += 1
                    if hook in OPTIONAL_HOOKS:
                        counts["total_optional_hooks"] += 1
                    break  # one hook per line in D2 output

            # 2 ▶️ optionalDependencies block (only if you also grepped it into D2)
            if '"optionalDependencies"' in text:
                counts["optional_dependencies"] += 1

            # 3 ▶️ scripts block (ditto)
            if '"scripts"' in text:
                counts["scripts_block"] += 1

    return counts, hook_counts


def write_summary(counts, hook_counts, out_path="D2_2"):
    with open(out_path, "w", encoding="utf-8") as out:
        out.write("=====================================\n")
        out.write("            D2 Summary\n")
        out.write("   Install / Publish / Optional Hooks\n")
        out.write("=====================================\n\n")

        out.write(f"Total lifecycle hooks found:  {counts['total_hooks']}\n")
        out.write(f"Optional lifecycle hooks:     {counts['total_optional_hooks']}\n")
        out.write(f"optionalDependencies blocks:  {counts['optional_dependencies']}\n")
        out.write(f"scripts blocks:               {counts['scripts_block']}\n\n")

        out.write("Per-hook counts:\n")
        for hook in LIFECYCLE_HOOKS:
            c = hook_counts.get(hook, 0)
            if c > 0:
                # mark optional hooks
                opt_flag = " (optional)" if hook in OPTIONAL_HOOKS else ""
                out.write(f"  - {hook:15s}: {c}{opt_flag}\n")

    print(f"[+] Wrote summary to {out_path}")


def main():
    if len(sys.argv) != 2:
        print("Usage: python3 analyze_D2.py static_features/D2")
        sys.exit(1)

    d2_path = sys.argv[1]
    counts, hook_counts = analyze_d2(d2_path)
    write_summary(counts, hook_counts, out_path="D2_2")


if __name__ == "__main__":
    main()

