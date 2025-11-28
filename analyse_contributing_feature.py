#!/usr/bin/env python3
"""
analyse_contributing_feature.py
Two usage styles:
1) Explicit CSV paths:
   python3 analyse_contributing_feature.py \
       --results-csv ground_truth_check/Analysis/batch_analysis_result.csv \
       --features-csv ground_truth_check/Analysis/ml_features.csv \
       --model-dir "Analysis Codes/classification_configuration" \
       --output ground_truth_check/Analysis/contributing_features.csv \
       --top-k 10
2) Analysis-dir shorthand (recommended):
   python3 analyse_contributing_feature.py \
       --analysis-dir ground_truth_check/Analysis \
       --top-k 10
   which is equivalent to:
       results-csv = <analysis-dir>/batch_analysis_result.csv
       features-csv = <analysis-dir>/ml_features.csv
       output      = <analysis-dir>/contributing_features.csv
Inputs
------
results-csv :
    CSV produced by generate_scan_results.py
    Must contain PACKAGE_NAME and a probability column
    (e.g. PROB_MALICIOUS / prob_malicious / predicted_prob).
features-csv :
    ml_features.csv (one row per package, columns:
    PACKAGE_NAME, feature1, feature2, ...).
model-dir :
    Folder containing quadratic model params:
      - theta_weights.npy
      - theta_bias.npy
      - norm_mean.npy
      - norm_std.npy
Output
------
CSV with one row per package:
  PACKAGE_NAME, Risk, Forced Risk High (Preinstall), PROB_MALICIOUS, FEATURE_1, ..., FEATURE_K
Each FEATURE_i cell contains:
  <feature_name>; lin=...; quad=...; raw=...;
  share=XX.XX%; severity=YY.YY% (=share*prob)
"""
import argparse
import os
import sys
import numpy as np
import pandas as pd


# ----------------- helpers ----------------- #
def load_npy(path: str):
    return np.load(path, allow_pickle=False)


def pick_prob_column(df: pd.DataFrame) -> str:
    """
    Try to find the probability column in results CSV.
    Supports: PROB_MALICIOUS, prob_malicious, predicted_prob, prob, etc.
    """
    lower_map = {c.lower(): c for c in df.columns}
    candidates = [
        "prob_malicious",
        "probability",
        "predicted_prob",
        "prob",
        "p_malicious",
    ]
    for key in candidates:
        if key in lower_map:
            return lower_map[key]
    raise ValueError(
        "Could not find probability column. Expected one of: "
        "PROB_MALICIOUS, prob_malicious, predicted_prob, prob, ..."
    )


# ----------------- main ----------------- #
def main():
    parser = argparse.ArgumentParser(
        description="Analyse feature contributions for a quadratic logistic model.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Examples:\n"
            "  # Explicit CSV paths\n"
            "  python3 analyse_contributing_feature.py \\\n"
            "      --results-csv ground_truth_check/Analysis/batch_analysis_result.csv \\\n"
            "      --features-csv ground_truth_check/Analysis/ml_features.csv \\\n"
            "      --model-dir \"Analysis Codes/classification_configuration\" \\\n"
            "      --output ground_truth_check/Analysis/contributing_features.csv \\\n"
            "      --top-k 10\n\n"
            "  # Shorthand using analysis-dir (recommended)\n"
            "  python3 analyse_contributing_feature.py \\\n"
            "      --analysis-dir ground_truth_check/Analysis \\\n"
            "      --top-k 10\n\n"
            "  In shorthand mode, defaults are:\n"
            "    results-csv = <analysis-dir>/batch_analysis_result.csv\n"
            "    features-csv = <analysis-dir>/ml_features.csv\n"
            "    output      = <analysis-dir>/contributing_features.csv\n"
        ),
    )

    # Shorthand root directory
    parser.add_argument(
        "--analysis-dir",
        help=(
            "Root analysis directory. If provided (and --results-csv / --features-csv "
            "are omitted), defaults to:\n"
            "  <analysis-dir>/batch_analysis_result.csv (results)\n"
            "  <analysis-dir>/ml_features.csv          (features)\n"
            "  <analysis-dir>/contributing_features.csv (output)"
        ),
    )

    # Direct CSV paths (optional; required if no analysis-dir)
    parser.add_argument(
        "--results-csv",
        help="CSV with PACKAGE_NAME and probability column "
             "(overrides --analysis-dir default if given).",
    )
    parser.add_argument(
        "--features-csv",
        help="CSV with PACKAGE_NAME and base features "
             "(overrides --analysis-dir default if given).",
    )

    # Model directory, with default so you don't need quotes if you just use default
    parser.add_argument(
        "--model-dir",
        default="Analysis Codes/classification_configuration",
        help="Directory containing quadratic model .npy files "
             "(default: 'Analysis Codes/classification_configuration').",
    )

    # Output path (optional; default depends on analysis-dir)
    parser.add_argument(
        "--output",
        help="Output CSV path. "
             "If --analysis-dir is given and --output is omitted, "
             "defaults to <analysis-dir>/contributing_features.csv. "
             "Otherwise defaults to ./contributing_features.csv.",
    )
    parser.add_argument(
        "--top-k",
        type=int,
        default=10,
        help="Number of top features to show per package (default: 10).",
    )

    # If run with no args, show help and exit nicely
    if len(sys.argv) == 1:
        parser.print_help()
        sys.exit(1)

    args = parser.parse_args()

    # -------- resolve paths based on analysis-dir / explicit args -------- #
    analysis_dir = args.analysis_dir
    # Start from explicit flags
    results_csv = args.results_csv
    features_csv = args.features_csv
    output_path = args.output

    if analysis_dir:
        # Use defaults derived from analysis-dir if explicit paths not given
        if results_csv is None:
            results_csv = os.path.join(analysis_dir, "batch_analysis_result.csv")
        if features_csv is None:
            features_csv = os.path.join(analysis_dir, "ml_features.csv")
        if output_path is None:
            output_path = os.path.join(analysis_dir, "contributing_features.csv")
    else:
        # No analysis-dir: require explicit CSV paths
        if results_csv is None or features_csv is None:
            parser.error(
                "You must either:\n"
                "  - provide --analysis-dir, OR\n"
                "  - provide both --results-csv and --features-csv."
            )
        if output_path is None:
            output_path = "contributing_features.csv"

    # Sanity prints
    print("[+] Resolved paths:")
    print(f"    results-csv : {results_csv}")
    print(f"    features-csv: {features_csv}")
    print(f"    model-dir   : {args.model_dir}")
    print(f"    output      : {output_path}")
    print(f"    top-k       : {args.top_k}")

    # ----- Load results CSV -----
    print("[+] Loading results CSV...")
    df_res_raw = pd.read_csv(results_csv)
    if "PACKAGE_NAME" not in df_res_raw.columns:
        raise ValueError("results CSV must contain PACKAGE_NAME column")

    # ---- NEW: extract Risk + Forced Risk High (Preinstall) helper cols ----
    if "RISK_LEVEL" in df_res_raw.columns:
        df_res_raw["__RISK_LEVEL__"] = df_res_raw["RISK_LEVEL"].astype(str)
    else:
        df_res_raw["__RISK_LEVEL__"] = ""

    def map_preinstall(val):
        if not isinstance(val, str) or not val.strip():
            return "No"
        text = val.strip()
        if text == "YES":
            return "Yes (F1_hook_preinstall)"
        if text.startswith("YES (with potential pkg/script manipulation"):
            return (
                "Yes (F1_hook_preinstall) with potential package/script manipulation "
                "(D2_pkg_json_write, D2_scripts_field_touch)"
            )
        # Fallback: keep some information rather than dropping it
        return text

    if "PREINSTALL" in df_res_raw.columns:
        df_res_raw["__FORCED_PRE__"] = df_res_raw["PREINSTALL"].apply(map_preinstall)
    else:
        df_res_raw["__FORCED_PRE__"] = "No"
    # -----------------------------------------------------------------------

    prob_col = pick_prob_column(df_res_raw)

    # Convert to numeric and drop non-numeric rows (e.g., RISK_BANDS)
    df_res = df_res_raw.copy()
    df_res["__prob_numeric__"] = pd.to_numeric(
        df_res[prob_col], errors="coerce"
    )
    df_res = df_res.dropna(subset=["__prob_numeric__"])
    df_res["__prob_numeric__"] = df_res["__prob_numeric__"].astype(float)
    print(f"[+] Using probability column: {prob_col}")
    print(f"[+] Packages with valid probabilities: {len(df_res)}")

    # ----- Load feature CSV -----
    print("[+] Loading ML features CSV...")
    df_feat = pd.read_csv(features_csv)
    if "PACKAGE_NAME" not in df_feat.columns:
        raise ValueError("features CSV must have a 'PACKAGE_NAME' column")
    df_feat = df_feat.set_index("PACKAGE_NAME")
    feature_names = list(df_feat.columns)
    n_features = len(feature_names)
    print(f"[+] Found {n_features} base features")

    # ----- Load model -----
    print(f"[+] Loading model from: {args.model_dir}")
    w = load_npy(os.path.join(args.model_dir, "theta_weights.npy"))
    b = load_npy(os.path.join(args.model_dir, "theta_bias.npy"))
    mean = load_npy(os.path.join(args.model_dir, "norm_mean.npy"))
    std = load_npy(os.path.join(args.model_dir, "norm_std.npy"))

    # Flatten mean / std in case they are (1, d)
    mean = np.asarray(mean).reshape(-1)
    std = np.asarray(std).reshape(-1)

    if w.shape[0] != 2 * n_features:
        raise ValueError(
            f"Feature count mismatch: model has {w.shape[0]} weights "
            f"for 2*d, but feature CSV has {n_features} columns."
        )

    w_lin = w[:n_features]
    w_quad = w[n_features:]
    print(
        f"[+] Detected quadratic model: {n_features} base features, "
        f"{w.shape[0]} weights (linear + quadratic)."
    )

    rows_out = []

    # ----- Per-package contributions -----
    for _, r in df_res.iterrows():
        pkg = str(r["PACKAGE_NAME"])
        prob = float(r["__prob_numeric__"])
        if pkg not in df_feat.index:
            # No feature row for this package -> skip
            continue

        x = df_feat.loc[pkg].to_numpy(dtype=float)

        # Normalize as during training
        x_norm = (x - mean) / (std + 1e-12)
        x_sq = x_norm ** 2

        raw_lin = w_lin * x_norm       # per-feature linear contribution
        raw_quad = w_quad * x_sq       # per-feature quadratic contribution
        raw_total = raw_lin + raw_quad

        abs_total = np.abs(raw_total)
        sum_abs = abs_total.sum()
        if sum_abs == 0:
            shares = np.zeros_like(raw_total)
        else:
            shares = abs_total / sum_abs

        severities = shares * prob  # share * overall probability

        # Sort features by absolute combined contribution (descending)
        order = np.argsort(-abs_total)

        # ---- NEW: include Risk + Forced Risk High (Preinstall) before score ----
        row_out = {
            "PACKAGE_NAME": pkg,
            "Risk": r["__RISK_LEVEL__"],
            "Forced Risk High (Preinstall)": r["__FORCED_PRE__"],
            "PROB_MALICIOUS": round(prob, 5),
        }
        # ------------------------------------------------------------------------

        for rank in range(args.top_k):
            if rank < len(order):
                i = int(order[rank])
                fname = feature_names[i]
                cell = (
                    f"{fname}; "
                    f"lin={raw_lin[i]:.5f}; "
                    f"quad={raw_quad[i]:.5f}; "
                    f"raw={raw_total[i]:.5f}; "
                    f"share={shares[i]*100:.2f}%; "
                    f"severity={severities[i]*100:.2f}% (=share*prob)"
                )
            else:
                cell = ""
            row_out[f"FEATURE_{rank+1}"] = cell

        rows_out.append(row_out)

    out_df = pd.DataFrame(rows_out)

    # Ensure output directory exists
    out_dir = os.path.dirname(os.path.abspath(output_path))
    if out_dir and not os.path.isdir(out_dir):
        os.makedirs(out_dir, exist_ok=True)

    out_df.to_csv(output_path, index=False)
    print(f"[+] Wrote feature contributions to: {output_path}")


if __name__ == "__main__":
    main()


