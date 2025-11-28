#!/usr/bin/env python3
"""
apply_model_score.py

Apply a trained quadratic logistic-regression model to new packages and classify
them into LOW / MEDIUM / HIGH risk.

Inputs:
  --features     : Path to ML feature CSV (same structure used for training).
                   First column must be PACKAGE_NAME.
  --model-dir    : Directory containing ONLY these files:
                      theta_weights.npy
                      theta_bias.npy
                      norm_mean.npy
                      norm_std.npy
                      thresholds   (text file containing low/high thresholds)

Outputs:
  * Prints results to terminal
  * Writes <features_basename>_analysis.csv containing:
        PACKAGE_NAME, RISK_LEVEL, PROB_MALICIOUS
        + last line showing the risk-band rules
"""

import argparse
import os
import numpy as np
import pandas as pd


# ---------------- Shared helpers ---------------- #

def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-z))


def add_quadratic_features(X):
    X_sq = X ** 2
    return np.hstack([X, X_sq])


def load_thresholds(path):
    low_thr = None
    high_thr = None

    with open(path, "r") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            if line.lower().startswith("low"):
                low_thr = float(line.split(":")[1].strip())
            elif line.lower().startswith("high"):
                high_thr = float(line.split(":")[1].strip())

    if low_thr is None or high_thr is None:
        raise ValueError("Thresholds file must contain lines:\n  low(<=): <value>\n  high(>=): <value>")

    return low_thr, high_thr


def classify(prob, low_thr, high_thr):
    if prob <= low_thr:
        return "LOW"
    elif prob < high_thr:
        return "MEDIUM"
    else:
        return "HIGH"


# ---------------- Main ---------------- #

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--features", required=True,
                        help="Path to generated ML features CSV.")
    parser.add_argument("--model-dir", required=True,
                        help="Directory containing 4 .npy files + thresholds.")
    parser.add_argument("--output", default=None,
                        help="Optional output CSV. Default: <basename>_analysis.csv")
    args = parser.parse_args()

    feature_path = args.features
    model_dir = args.model_dir

    # --- Load model files ---
    w = np.load(os.path.join(model_dir, "theta_weights.npy"))
    b = float(np.load(os.path.join(model_dir, "theta_bias.npy")))
    X_mean = np.load(os.path.join(model_dir, "norm_mean.npy"))
    X_std = np.load(os.path.join(model_dir, "norm_std.npy"))

    low_thr, high_thr = load_thresholds(os.path.join(model_dir, "thresholds"))
    print(f"[+] Thresholds loaded: LOW <= {low_thr:.5f}, HIGH >= {high_thr:.5f}")

    # --- Load feature file ---
    df = pd.read_csv(feature_path)

    # Package names
    pkg_names = df.iloc[:, 0].astype(str).values

    # Numeric columns = all except first column
    numeric_cols = df.columns[1:]
    X = df[numeric_cols].apply(pd.to_numeric, errors="coerce").fillna(0).values

    # Check feature dimension
    if X.shape[1] != X_mean.shape[1]:
        raise ValueError(
            f"Feature mismatch: input has {X.shape[1]} features but model expects {X_mean.shape[1]}"
        )

    # --- Preprocess: normalize + quadratic ---
    X_norm = (X - X_mean) / X_std
    X_feat = add_quadratic_features(X_norm)

    if X_feat.shape[1] != len(w):
        raise ValueError(
            f"Quadratic feature mismatch: got {X_feat.shape[1]} features, model expects {len(w)}"
        )

    # --- Predict ---
    raw_scores = X_feat @ w + b
    probs = sigmoid(raw_scores)
    prob5 = np.round(probs, 5)

    # --- Classify ---
    risks = [classify(p, low_thr, high_thr) for p in probs]

    # --- Print results ---
    print("\n[+] Classification Results")
    print("    LOW  <= {:.5f}".format(low_thr))
    print("    MEDIUM between ({:.5f}, {:.5f})".format(low_thr, high_thr))
    print("    HIGH >= {:.5f}\n".format(high_thr))

    for name, risk, p in zip(pkg_names, risks, prob5):
        print(f"{name:40s}  {risk:6s}  {p:.5f}")

    # --- Save CSV ---
    if args.output:
        out_csv = args.output
    else:
        base = os.path.splitext(os.path.basename(feature_path))[0]
        out_csv = f"{base}_analysis.csv"

    out_df = pd.DataFrame({
        "PACKAGE_NAME": pkg_names,
        "RISK_LEVEL": risks,
        "PROB_MALICIOUS": prob5
    })

    bands_text = (
        f"score <= {low_thr:.5f} => LOW; "
        f"{low_thr:.5f} < score < {high_thr:.5f} => MEDIUM; "
        f"score >= {high_thr:.5f} => HIGH"
    )

    out_df.loc[len(out_df)] = ["RISK_BANDS", "", bands_text]

    out_df.to_csv(out_csv, index=False)
    print(f"\n[+] Saved analysis: {out_csv}")
    print("[+] Done.")


if __name__ == "__main__":
    main()


