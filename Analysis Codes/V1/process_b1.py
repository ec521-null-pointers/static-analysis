#!/usr/bin/env python3
import re
import sys
from collections import defaultdict

# ---- Provider classification rules ----
PROVIDER_RULES = {
    "AWS":       r"^AWS_",
    "GCP":       r"^GOOGLE_",
    "GitHub":    r"^GITHUB_",
    "npm":       r"^NPM_",
    "GitLab":    r"^GITLAB_",
    "Azure":     r"^(AZURE_|AZ_)",
    "Vercel":    r"^VERCEL_",
    "Netlify":   r"^NETLIFY_",
    "Heroku":    r"^HEROKU_",
}

DEFAULT_PROVIDER = "Unknown"


def classify_provider(varname):
    for provider, pattern in PROVIDER_RULES.items():
        if re.search(pattern, varname):
            return provider
    return DEFAULT_PROVIDER


def main(input_path, output_path):
    secrets = []
    provider_map = defaultdict(list)

    with open(input_path, "r") as f:
        for line in f:
            m = re.search(r"process\.env\.([A-Za-z0-9_]+)", line)
            if m:
                varname = m.group(1)
                secrets.append(varname)
                provider = classify_provider(varname)
                provider_map[provider].append(varname)

    # Generate output file
    with open(output_path, "w") as out:
        out.write("===========================================\n")
        out.write("   Static Credential Feature Summary\n")
        out.write("===========================================\n\n")

        # Counts
        out.write(f"Total Secrets (N_secrets): {len(secrets)}\n")
        out.write(f"Total Providers (N_providers): {len(provider_map.keys())}\n\n")

        # Provider list
        out.write("Providers Found:\n")
        for p in provider_map:
            out.write(f" - {p}\n")

        # Secrets per provider
        out.write("\nSecrets by Provider:\n")
        for p, vars_ in provider_map.items():
            out.write(f"\n[{p}]  ({len(vars_)} secrets)\n")
            for v in vars_:
                out.write(f"   • {v}\n")

        # Raw Secrets
        out.write("\nRaw Secret List:\n")
        for s in secrets:
            out.write(f" - {s}\n")

    print(f"Output written to: {output_path}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 analyze_B1.py B1")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = "B1_2"      # step 2 output file
    main(input_path, output_path)
