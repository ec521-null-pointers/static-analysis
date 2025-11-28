#!/usr/bin/env python3
import os
import sys
import pandas as pd


def main():
    # ---------------------------------------------------------
    # Parse arguments
    # ---------------------------------------------------------
    if len(sys.argv) < 2:
        print("Usage: python3 tag_preinstall_packages.py <ANALYSIS_ROOT> [-overwrite]")
        sys.exit(1)

    analysis_root = sys.argv[1]
    overwrite = (len(sys.argv) >= 3 and sys.argv[2] == "-overwrite")

    scores_path = os.path.join(analysis_root, "Consolidated_Package_Scores.tsv")
    batch_path = os.path.join(analysis_root, "batch_analysis_result.csv")

    if overwrite:
        output_path = batch_path  # overwrite original
    else:
        output_path = os.path.join(
            analysis_root, "batch_analysis_result_w_preinstall.csv"
        )

    # ---------------------------------------------------------
    # Validate paths
    # ---------------------------------------------------------
    if not os.path.isfile(scores_path):
        print(f"ERROR: Cannot find {scores_path}")
        sys.exit(1)
    if not os.path.isfile(batch_path):
        print(f"ERROR: Cannot find {batch_path}")
        sys.exit(1)

    # ---------------------------------------------------------
    # 1) Load Consolidated_Package_Scores.tsv
    # ---------------------------------------------------------
    df_scores = pd.read_csv(scores_path, sep="\t")

    # package name column detection
    if "PACKAGE_NAME" in df_scores.columns:
        pkg_col = "PACKAGE_NAME"
    elif "package" in df_scores.columns:
        pkg_col = "package"
    else:
        raise KeyError(
            "Could not find PACKAGE_NAME or package column in Consolidated_Package_Scores.tsv"
        )

    # required columns
    required_cols = ["F1_hook_preinstall", "D2_scripts_field_touch", "D2_pkg_json_write"]
    for col in required_cols:
        if col not in df_scores.columns:
            raise KeyError(
                f"Missing column '{col}' in Consolidated_Package_Scores.tsv"
            )

    # numeric conversion
    for col in required_cols:
        df_scores[col] = pd.to_numeric(df_scores[col], errors="coerce").fillna(0)

    # preinstall hits
    df_pre = df_scores[df_scores["F1_hook_preinstall"] == 1].copy()

    # script manipulation flag
    df_pre["pkg_script_manipulation"] = (
        df_pre["D2_scripts_field_touch"] + df_pre["D2_pkg_json_write"] > 1
    )

    # build mapping: package -> if script manipulation present
    preinstall_map = {}
    for _, row in df_pre.iterrows():
        name = str(row[pkg_col])
        flag = bool(row["pkg_script_manipulation"])
        preinstall_map[name] = preinstall_map.get(name, False) or flag

    print(f"Found {len(preinstall_map)} packages with F1_hook_preinstall == 1")

    # ---------------------------------------------------------
    # 2) Load batch_analysis_result.csv
    # ---------------------------------------------------------
    df_batch = pd.read_csv(batch_path)

    if "PACKAGE_NAME" not in df_batch.columns:
        raise KeyError("batch_analysis_result.csv must contain 'PACKAGE_NAME'")
    if "RISK_LEVEL" not in df_batch.columns:
        raise KeyError("batch_analysis_result.csv must contain 'RISK_LEVEL'")

    # Prepare PREINSTALL column if missing
    if "PREINSTALL" not in df_batch.columns:
        df_batch["PREINSTALL"] = ""

    # Helper flags
    df_batch["_has_preinstall"] = df_batch["PACKAGE_NAME"].map(
        lambda n: str(n) in preinstall_map
    )
    df_batch["_script_manip"] = df_batch["PACKAGE_NAME"].map(
        lambda n: preinstall_map.get(str(n), False)
    )

    mask_pre = df_batch["_has_preinstall"]

    # Update risk
    df_batch.loc[mask_pre, "RISK_LEVEL"] = "HIGH"

    # PREINSTALL text
    df_batch.loc[mask_pre & df_batch["_script_manip"], "PREINSTALL"] = (
        "YES (with potential pkg/script manipulation)"
    )
    df_batch.loc[mask_pre & ~df_batch["_script_manip"], "PREINSTALL"] = "YES"

    # ---------------------------------------------------------
    # 2b) Update RISK_BANDS summary row (if present)
    # ---------------------------------------------------------
    bands_mask = df_batch["PACKAGE_NAME"] == "RISK_BANDS"
    if bands_mask.any():
        df_batch.loc[
            bands_mask, "PREINSTALL"
        ] = "YES = preinstall present; RISK_LEVEL forced to HIGH"

    # Remove helper columns
    df_batch = df_batch.drop(columns=["_has_preinstall", "_script_manip"])

    # ---------------------------------------------------------
    # 3) Save output
    # ---------------------------------------------------------
    df_batch.to_csv(output_path, index=False)

    if overwrite:
        print(f"Updated (overwritten): {batch_path}")
    else:
        print(f"Output written to new file:\n  {output_path}")


if __name__ == "__main__":
    main()


