#!/usr/bin/env python3
import sys
import os

FEATURE_ID = "F1"

USAGE = f"Usage: python3 process_{FEATURE_ID}.py <F1_hits_file> <package_json_path>"

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


def get_label(path: str) -> str:
    """Convert F1_filename--path style."""
    base = os.path.basename(path)
    prefix = FEATURE_ID + "_"
    if base.startswith(prefix):
        return base[len(prefix):]
    return base


def main():
    if len(sys.argv) != 3:
        print(USAGE, file=sys.stderr)
        sys.exit(1)

    hits_file = sys.argv[1]
    pkg_json_path = sys.argv[2]

    if not os.path.exists(hits_file):
        print(f"[ERROR] Cannot find hits file: {hits_file}", file=sys.stderr)
        sys.exit(1)

    label = get_label(hits_file)

    out_counts = f"{FEATURE_ID}_hits_{label}"
    out_details = f"{FEATURE_ID}_2_{label}"

    # ---- Counters ----
    counts = {
        "total_hooks": 0,
        "total_optional_hooks": 0,
        "optionalDependencies": 0,
        "scripts_block": 0,
    }

    hook_counts = {h: 0 for h in LIFECYCLE_HOOKS}

    # ---- Parse hits ----
    with open(hits_file, "r", encoding="utf-8", errors="ignore") as f:
        for raw in f:
            line = raw.strip()
            if not line:
                continue

            parts = line.split(":", 2)
            if len(parts) == 3:
                _, _, text = parts
            else:
                text = line

            # Match lifecycle hooks
            for hook in LIFECYCLE_HOOKS:
                if f"\"{hook}\"" in text or f"'{hook}'" in text:
                    counts["total_hooks"] += 1
                    hook_counts[hook] += 1
                    if hook in OPTIONAL_HOOKS:
                        counts["total_optional_hooks"] += 1
                    break

            if '"optionalDependencies"' in text:
                counts["optionalDependencies"] += 1

            if '"scripts"' in text:
                counts["scripts_block"] += 1

    # ------------------------------------
    # 1) Counts file (for ML scoring)
    # ------------------------------------
    with open(out_counts, "w") as out:
        out.write(f"{FEATURE_ID}_total_hooks: {counts['total_hooks']}\n")
        out.write(f"{FEATURE_ID}_optional_hooks: {counts['total_optional_hooks']}\n")
        out.write(f"{FEATURE_ID}_optionalDependencies: {counts['optionalDependencies']}\n")
        out.write(f"{FEATURE_ID}_scripts_block: {counts['scripts_block']}\n")

        # print all hook counts explicitly
        for hook in LIFECYCLE_HOOKS:
            out.write(f"{FEATURE_ID}_hook_{hook}: {hook_counts.get(hook, 0)}\n")

    # ------------------------------------
    # 2) Detailed summary file
    # ------------------------------------
    with open(out_details, "w") as out:
        out.write("===========================================\n")
        out.write("   F1 – package.json Lifecycle Hooks\n")
        out.write("===========================================\n\n")

        out.write(f"Hits file:    {hits_file}\n")
        out.write(f"package.json: {pkg_json_path}\n\n")

        out.write("[Summary]\n")
        out.write(f"Total lifecycle hooks:       {counts['total_hooks']}\n")
        out.write(f"Optional lifecycle hooks:    {counts['total_optional_hooks']}\n")
        out.write(f"optionalDependencies blocks: {counts['optionalDependencies']}\n")
        out.write(f"scripts blocks:              {counts['scripts_block']}\n\n")

        out.write("Per-hook counts:\n")
        for hook in LIFECYCLE_HOOKS:
            c = hook_counts[hook]
            flag = " (optional)" if hook in OPTIONAL_HOOKS else ""
            out.write(f"  - {hook:15s}: {c}{flag}\n")

        out.write("\n[Details]\n")
        out.write(f"arg1(hits_file): {hits_file}\n")
        out.write(f"arg2(package.json): {pkg_json_path}\n")

    print(f"[+] {FEATURE_ID} counts written to {out_counts}")
    print(f"[+] {FEATURE_ID} details written to {out_details}")


if __name__ == "__main__":
    main()


