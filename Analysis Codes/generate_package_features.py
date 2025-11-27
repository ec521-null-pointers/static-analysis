#!/usr/bin/env python3
"""
build_ml_features.py

Usage:
    python3 build_ml_features.py input_results.tsv output_features.csv [--fill-missing]

- input_results.tsv  : Consolidated per-package scores (tab-separated)
- output_features.csv: ML feature matrix for training (comma-separated)
- --fill-missing     : If present, any missing required columns are created with 0
                       instead of causing an error.

This script implements the transformation described in Conversion.xlsx:
* "Count = Yes"  → raw count feature (except rows marked "Binary" or "Generate").
* "Count = Binary" → binary feature: 1 if original count > 0, else 0.
* "Density = Yes" → density feature: count / PACKAGE_SIZE_BYTES * 100000.
* D1_total_hits is re-generated as the sum of all D1_ecosystem_* counts.
* D1_ext_unique_ecosystems is the number of D1_ecosystem_* columns with count > 0.
* E2_ext_ge_10000 and E2_ext_ge_100000 are OR-combos of E2_bin_* buckets.
* Combo 4/5/6 flags are implemented exactly as specified.
* NEW: A1_total (sum of all 6 A1 counts) and A1_total_density
       (A1_total / PACKAGE_SIZE_BYTES * 100000).

IMPORTANT:
- The FIRST column in input_results.tsv is always treated as PACKAGE_NAME (identifier).
- PACKAGE_NAME is kept in the output but is not meant to be used as an ML feature.
- PACKAGE_SIZE_BYTES is ONLY used for density calculations and then dropped.
"""

import sys
import os
from typing import List, Set
import pandas as pd

# ---------------------------------------------------------------------------
# 1. CONFIG: which columns are used and how
# ---------------------------------------------------------------------------

# ----- 1.1 Raw count features (Count = "Yes" in Conversion.xlsx) -----
COUNT_FEATURES: List[str] = [
    # A1
    "A1_command_literal",
    "A1_command_url",
    "A1_command_variable",
    "A1_dynamic_literal",
    "A1_dynamic_url",
    "A1_dynamic_variable",
    # A2
    "A2_decode_string_literal",
    "A2_decode_variable",
    # A3
    "A3_CONFIG_OR_URL",
    "A3_LOG_OR_MESSAGE",
    "A3_OTHER",
    "A3_SECRETS",
    # B1
    "B1_total_providers",
    "B1_total_refs",
    "B1_total_secrets",
    # B2
    "B2_EXCHANGE",
    "B2_OTHER",
    "B2_PUBLISH",
    "B2_VALIDATE",
    "B2_total_events",
    "B2_total_providers",
    # C1
    "C1_API_PASTEBIN",
    "C1_API_WEBHOOK_SITE",
    "C1_CLOUD_METADATA",
    "C1_CLOUD_PROVIDER",
    "C1_DEV_HOST",
    "C1_LOCALHOST",
    "C1_PACKAGE_INFRA",
    "C1_PUBLIC_IP",
    "C1_domain_url_hits",
    "C1_ip_url_hits",
    "C1_raw_url_hits",
    "C1_skipped_invalid_urls",
    "C1_suspicious_ip_hits",
    "C1_valid_url_hits",
    # C2
    "C2_cloud_auth",
    "C2_dev_code_host",
    "C2_other_suspicious",
    "C2_sink_exfil",
    "C2_total_hits",
    # C3
    "C3_generic_exec_like",
    "C3_net_fetch",
    "C3_net_generic_request",
    "C3_net_node_dns_module",
    "C3_net_node_http_module",
    "C3_net_websocket",
    "C3_proc_child_exec",
    # D1
    "D1_auth",
    "D1_publish",
    "D1_push",
    # D2
    "D2_lifecycle_hook_string",
    "D2_pkg_json_write",
    "D2_scripts_field_touch",
]

# The six A1 columns (for A1_total / A1_total_density)
A1_COLS: List[str] = [
    "A1_command_literal",
    "A1_command_url",
    "A1_command_variable",
    "A1_dynamic_literal",
    "A1_dynamic_url",
    "A1_dynamic_variable",
]

# ----- 1.2 Binary count features (Count = "Binary" in Conversion.xlsx) -----
BINARY_COUNT_FEATURES: List[str] = [
    "E2_bin_ge_1000000",
    "F1_hook_postinstall",
    "F1_hook_preinstall",
    "F1_hook_prepare",
    "F1_optionalDependencies",
    "F1_scripts_block",
]

# ----- 1.3 Density features (Density = "Yes" in Conversion.xlsx) -----
# We produce <name>_density = count / PACKAGE_SIZE_BYTES * 100000
DENSITY_BASE_FEATURES: List[str] = [
    # A1
    "A1_command_literal",
    "A1_command_url",
    "A1_command_variable",
    "A1_dynamic_literal",
    "A1_dynamic_url",
    "A1_dynamic_variable",
    # A2
    "A2_decode_string_literal",
    "A2_decode_variable",
    # A3
    "A3_CONFIG_OR_URL",
    "A3_LOG_OR_MESSAGE",
    "A3_OTHER",
    "A3_SECRETS",
    # C1
    "C1_CLOUD_PROVIDER",
    "C1_DEV_HOST",
    "C1_LOCALHOST",
    "C1_PACKAGE_INFRA",
    "C1_PUBLIC_IP",
    "C1_domain_url_hits",
    "C1_ip_url_hits",
    "C1_raw_url_hits",
    "C1_skipped_invalid_urls",
    "C1_valid_url_hits",
    # C2
    "C2_cloud_auth",
    "C2_dev_code_host",
    "C2_total_hits",
    # C3
    "C3_generic_exec_like",
    "C3_net_fetch",
    "C3_net_generic_request",
    "C3_net_node_dns_module",
    "C3_net_node_http_module",
    "C3_proc_child_exec",
]

# ----- 1.4 D1 ecosystem columns used to build D1_total_hits & D1_ext -----
D1_ECOSYSTEM_COLS: List[str] = [
    "D1_ecosystem_bun",
    "D1_ecosystem_cargo",
    "D1_ecosystem_docker",
    "D1_ecosystem_dotnet",
    "D1_ecosystem_flit",
    "D1_ecosystem_gh",
    "D1_ecosystem_git",
    "D1_ecosystem_go",
    "D1_ecosystem_gradle",
    "D1_ecosystem_mvn",
    "D1_ecosystem_npm",
    "D1_ecosystem_nuget",
    "D1_ecosystem_pip",
    "D1_ecosystem_pnpm",
    "D1_ecosystem_podman",
    "D1_ecosystem_poetry",
    "D1_ecosystem_yarn",
]

# ----- 1.5 E2 bucket columns used for E2_ext -----
E2_BUCKET_COLS: List[str] = [
    "E2_bin_100000_999999",
    "E2_bin_10000_99999",
    "E2_bin_ge_1000000",
]

# ----- 1.6 Columns used only inside combos -----
COMBO_INPUT_COLS: List[str] = [
    # For Combo 1 & 2
    "F1_hook_install",
    "F1_hook_preinstall",
    "F1_hook_postinstall",
    "D2_pkg_json_write",
    "D2_scripts_field_touch",
    # For Combo 3 & 4
    "B1_total_secrets",
    "C1_API_PASTEBIN",
    "C1_API_WEBHOOK_SITE",
    "C1_suspicious_ip_hits",
    "C2_sink_exfil",
    "C3_net_websocket",
    "D2_lifecycle_hook_string",
    "B2_total_events",
    "D1_auth",
    "D1_publish",
    "D1_push",
]

# ---------------------------------------------------------------------------
# 2. Helper: verify / fill required columns
# ---------------------------------------------------------------------------

def ensure_required_columns(df: pd.DataFrame,
                            required: Set[str],
                            fill_missing: bool) -> pd.DataFrame:
    """
    Ensure all required columns exist.
    If fill_missing is False:
        - print a list of missing columns and exit(1) if any are missing.
    If fill_missing is True:
        - create missing columns with value 0.
    """
    missing = [c for c in sorted(required) if c not in df.columns]
    if missing and not fill_missing:
        print("[ERROR] The following required columns are missing from input:")
        for c in missing:
            print(f" - {c}")
        print("Please check your results.tsv / feature extraction or run with --fill-missing")
        print("if you want to treat missing columns as 0.")
        sys.exit(1)

    if missing and fill_missing:
        for c in missing:
            df[c] = 0

    return df

# ---------------------------------------------------------------------------
# 3. Feature builders
# ---------------------------------------------------------------------------

def add_count_features(df: pd.DataFrame, out: pd.DataFrame) -> pd.DataFrame:
    for col in COUNT_FEATURES:
        out[col] = df[col].fillna(0)
    return out


def add_binary_features(df: pd.DataFrame, out: pd.DataFrame) -> pd.DataFrame:
    for col in BINARY_COUNT_FEATURES:
        out[col] = (df[col].fillna(0) > 0).astype(int)
    return out


def add_density_features(df: pd.DataFrame, out: pd.DataFrame) -> pd.DataFrame:
    # Densities: count / PACKAGE_SIZE_BYTES * 100000
    size = pd.to_numeric(df["PACKAGE_SIZE_BYTES"], errors="coerce").replace(0, pd.NA)
    for col in DENSITY_BASE_FEATURES:
        dens_name = f"{col}_density"
        dens = (df[col].fillna(0) / size) * 100000
        out[dens_name] = dens.fillna(0)
    return out


def add_a1_total_features(df: pd.DataFrame, out: pd.DataFrame) -> pd.DataFrame:
    """
    Add:
      - A1_total: sum of all six A1 columns
      - A1_total_density: A1_total / PACKAGE_SIZE_BYTES * 100000
    """
    size = pd.to_numeric(df["PACKAGE_SIZE_BYTES"], errors="coerce").replace(0, pd.NA)

    a1_total = df[A1_COLS].fillna(0).sum(axis=1)
    out["A1_total"] = a1_total

    a1_total_density = (a1_total / size) * 100000
    out["A1_total_density"] = a1_total_density.fillna(0)

    return out


def add_d1_features(df: pd.DataFrame, out: pd.DataFrame) -> pd.DataFrame:
    d1_total = df[D1_ECOSYSTEM_COLS].fillna(0).sum(axis=1)
    out["D1_total_hits"] = d1_total
    d1_ext = (df[D1_ECOSYSTEM_COLS].fillna(0) > 0).sum(axis=1)
    out["D1_ext_unique_ecosystems"] = d1_ext.astype(int)
    return out


def add_e2_ext_features(df: pd.DataFrame, out: pd.DataFrame) -> pd.DataFrame:
    e2_ge_10k = (
        (df["E2_bin_10000_99999"].fillna(0) > 0)
        | (df["E2_bin_100000_999999"].fillna(0) > 0)
        | (df["E2_bin_ge_1000000"].fillna(0) > 0)
    ).astype(int)
    out["E2_ext_ge_10000"] = e2_ge_10k

    e2_ge_100k = (
        (df["E2_bin_100000_999999"].fillna(0) > 0)
        | (df["E2_bin_ge_1000000"].fillna(0) > 0)
    ).astype(int)
    out["E2_ext_ge_100000"] = e2_ge_100k

    return out


def add_combo_features(df: pd.DataFrame, out: pd.DataFrame) -> pd.DataFrame:
    # Combo 1: Package.json modification
    has_pkg_write = (df["D2_pkg_json_write"].fillna(0) > 0).astype(int)
    has_install_hook = (
        (df["F1_hook_install"].fillna(0) > 0)
        | (df["F1_hook_preinstall"].fillna(0) > 0)
        | (df["F1_hook_postinstall"].fillna(0) > 0)
    ).astype(int)
    out["combo4a_pkgwrite_install"] = (
        (has_pkg_write == 1) & (has_install_hook == 1)
    ).astype(int)

    # Combo 2: Script modification
    has_scripts_touch = (df["D2_scripts_field_touch"].fillna(0) > 0).astype(int)
    out["combo4b_scripts_install"] = (
        (has_scripts_touch == 1) & (has_install_hook == 1)
    ).astype(int)

    # Combo 3: Secret exfiltration
    has_secrets = (df["B1_total_secrets"].fillna(0) > 0).astype(int)
    has_strong_exfil = (
        (df["C1_API_PASTEBIN"].fillna(0) > 0)
        | (df["C1_API_WEBHOOK_SITE"].fillna(0) > 0)
        | (df["C1_suspicious_ip_hits"].fillna(0) > 0)
        | (df["C2_sink_exfil"].fillna(0) > 0)
    ).astype(int)
    has_realtime_exfil = (df["C3_net_websocket"].fillna(0) > 0).astype(int)
    out["combo5a_secrets_highrisk_exfil"] = (
        (has_secrets == 1) & ((has_strong_exfil == 1) | (has_realtime_exfil == 1))
    ).astype(int)

    # Combo 4: Worm behaviour
    has_install_trigger = (
        (df["F1_hook_install"].fillna(0) > 0)
        | (df["F1_hook_preinstall"].fillna(0) > 0)
        | (df["F1_hook_postinstall"].fillna(0) > 0)
        | (df["D2_lifecycle_hook_string"].fillna(0) > 0)
    ).astype(int)
    has_credentials = (
        (df["B1_total_secrets"].fillna(0) > 0)
        | (df["B2_total_events"].fillna(0) > 0)
        | (df["D1_auth"].fillna(0) > 0)
    ).astype(int)
    has_supply_chain_actions = (
        (df["D1_publish"].fillna(0) > 0)
        | (df["D1_push"].fillna(0) > 0)
    ).astype(int)
    out["combo6a_worm_strong"] = (
        (has_install_trigger == 1)
        & (has_credentials == 1)
        & (has_supply_chain_actions == 1)
    ).astype(int)

    return out

# ---------------------------------------------------------------------------
# 4. Main
# ---------------------------------------------------------------------------

def main():
    if len(sys.argv) < 3:
        print(
            "Usage: python3 build_ml_features.py "
            "input_results.tsv output_features.csv [--fill-missing]"
        )
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]
    fill_missing = "--fill-missing" in sys.argv

    if not os.path.exists(input_path):
        print(f"[ERROR] Input file not found: {input_path}")
        sys.exit(1)

    print(f"[+] Loading TSV: {input_path}")
    df = pd.read_csv(input_path, sep="\t")

    # Required columns (including PACKAGE_SIZE_BYTES for densities)
    required_cols: Set[str] = set()
    required_cols.update(COUNT_FEATURES)
    required_cols.update(BINARY_COUNT_FEATURES)
    required_cols.update(DENSITY_BASE_FEATURES)
    required_cols.update(D1_ECOSYSTEM_COLS)
    required_cols.update(E2_BUCKET_COLS)
    required_cols.update(COMBO_INPUT_COLS)
    required_cols.add("PACKAGE_SIZE_BYTES")

    df = ensure_required_columns(df, required_cols, fill_missing=fill_missing)

    # ------------------------------------------------------------------
    # Build output feature DataFrame
    # ------------------------------------------------------------------
    # Always treat the first column as the package identifier
    first_col = df.columns[0]
    out = pd.DataFrame({
        "PACKAGE_NAME": df[first_col].astype(str)
    })

    print("[+] Adding count features...")
    out = add_count_features(df, out)

    print("[+] Adding binary features...")
    out = add_binary_features(df, out)

    print("[+] Adding density features...")
    out = add_density_features(df, out)

    print("[+] Adding A1_total and A1_total_density...")
    out = add_a1_total_features(df, out)

    print("[+] Adding D1_total_hits and D1_ext_unique_ecosystems...")
    out = add_d1_features(df, out)

    print("[+] Adding E2_ext features...")
    out = add_e2_ext_features(df, out)

    print("[+] Adding combo features (4a, 4b, 5a, 6a)...")
    out = add_combo_features(df, out)

    # We never want PACKAGE_SIZE_BYTES as a feature
    if "PACKAGE_SIZE_BYTES" in out.columns:
        out = out.drop(columns=["PACKAGE_SIZE_BYTES"])

    print(f"[+] Writing features → {output_path}")
    out.to_csv(output_path, index=False)
    print("[+] Done.")


if __name__ == "__main__":
    main()


