#!/usr/bin/env python3
"""
threshold_curve.py

Usage:
    python3 threshold_curve.py --input-csv path/to/figure1_data.csv \
                               --output-prefix threshold_curve \
                               --threshold1 0.044 --threshold2 0.234

Inputs:
  - CSV produced by log_regression_* scripts, expected columns:
        prob_malicious : float, P(y=1 | x)
        label          : int, 0 for good, 1 for malicious

Outputs (for given --output-prefix, default: "threshold_curve"):
  - <prefix>_fpr_fnr.csv:
        threshold, TP, FP, TN, FN, fpr, fnr, n_pos, n_neg
  - <prefix>_fpr_fnr.png:
        Plot of FPR and FNR vs threshold, with optional vertical lines for
        threshold1 / threshold2, a table of FPR/FNR at those thresholds,
        and a risk-band summary line.

Threshold sweep:
  - thresholds from 0.00 to 1.00 (inclusive) in steps of --step
    (default 0.01). Values written to CSV are rounded to 5 decimals.
"""

import argparse
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")  # non-interactive backend, just save PNG
import matplotlib.pyplot as plt
from matplotlib import gridspec


def compute_fpr_fnr_curve(probs, labels, step=0.01):
    """
    Compute FPR and FNR for thresholds from 0.0 to 1.0 (inclusive)
    with given step.

    probs  : array-like, probabilities P(y=1|x)
    labels : array-like, true labels in {0,1}
    step   : float, threshold increment
    """
    probs = np.asarray(probs, dtype=float)
    labels = np.asarray(labels, dtype=int)

    if probs.shape[0] != labels.shape[0]:
        raise ValueError("probs and labels must have same length")

    n_pos = int(np.sum(labels == 1))
    n_neg = int(np.sum(labels == 0))

    # Use full precision in computation; we only round when writing out.
    thresholds = np.arange(0.0, 1.0 + step / 2.0, step)

    rows = []
    for thr in thresholds:
        # predict 1 (malicious) if prob >= threshold
        y_pred = (probs >= thr).astype(int)
        TP = int(np.sum((labels == 1) & (y_pred == 1)))
        TN = int(np.sum((labels == 0) & (y_pred == 0)))
        FP = int(np.sum((labels == 0) & (y_pred == 1)))
        FN = int(np.sum((labels == 1) & (y_pred == 0)))

        # Handle division by zero carefully
        fpr = FP / (FP + TN) if (FP + TN) > 0 else 0.0
        fnr = FN / (FN + TP) if (FN + TP) > 0 else 0.0

        rows.append({
            # store with 5-decimal rounding for output
            "threshold": float(np.round(thr, 5)),
            "TP": TP,
            "FP": FP,
            "TN": TN,
            "FN": FN,
            "fpr": float(np.round(fpr, 5)),
            "fnr": float(np.round(fnr, 5)),
            "n_pos": n_pos,
            "n_neg": n_neg,
        })

    return pd.DataFrame(rows)


def fpr_fnr_at_threshold(probs, labels, thr):
    """
    Compute TP, FP, TN, FN, fpr, fnr at a specific threshold.
    Returns (TP, FP, TN, FN, fpr, fnr).
    """
    probs = np.asarray(probs, dtype=float)
    labels = np.asarray(labels, dtype=int)

    y_pred = (probs >= thr).astype(int)
    TP = int(np.sum((labels == 1) & (y_pred == 1)))
    TN = int(np.sum((labels == 0) & (y_pred == 0)))
    FP = int(np.sum((labels == 0) & (y_pred == 1)))
    FN = int(np.sum((labels == 1) & (y_pred == 0)))

    fpr = FP / (FP + TN) if (FP + TN) > 0 else 0.0
    fnr = FN / (FN + TP) if (FN + TP) > 0 else 0.0
    return TP, FP, TN, FN, fpr, fnr


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--input-csv",
        required=True,
        help="Path to input CSV (e.g. log_regression_quadratic_figure1_data.csv)",
    )
    parser.add_argument(
        "--output-prefix",
        default="threshold_curve",
        help="Prefix for output files (CSV and PNG)",
    )
    parser.add_argument(
        "--step",
        type=float,
        default=0.01,
        help="Threshold increment (default: 0.01). "
             "Use smaller (e.g. 0.001) for finer sweep.",
    )
    parser.add_argument(
        "--threshold1",
        type=float,
        default=None,
        help="Optional lower risk boundary (e.g. 0.044 for low vs medium).",
    )
    parser.add_argument(
        "--threshold2",
        type=float,
        default=None,
        help="Optional upper risk boundary (e.g. 0.234 for medium vs high).",
    )
    args = parser.parse_args()

    print(f"[+] Loading input CSV: {args.input_csv}")
    df = pd.read_csv(args.input_csv)

    if "prob_malicious" not in df.columns or "label" not in df.columns:
        raise ValueError(
            "Input CSV must contain 'prob_malicious' and 'label' columns."
        )

    probs = df["prob_malicious"].values
    labels = df["label"].values

    print("[+] Computing FPR/FNR curve...")
    curve_df = compute_fpr_fnr_curve(probs, labels, step=args.step)
    csv_out = f"{args.output_prefix}_fpr_fnr.csv"
    curve_df.to_csv(csv_out, index=False)
    print(f"[+] Saved FPR/FNR table: {csv_out}")

    # ---- Optional: compute stats at threshold1 / threshold2 ----
    t1 = args.threshold1
    t2 = args.threshold2
    t_rows = []   # for the table under the plot

    if t1 is not None:
        TP1, FP1, TN1, FN1, fpr1, fnr1 = fpr_fnr_at_threshold(probs, labels, t1)
        t_rows.append((t1, fpr1, fnr1))
        print(
            f"[threshold1={t1:.5f}] "
            f"TP={TP1}, FP={FP1}, TN={TN1}, FN={FN1}, "
            f"FPR={fpr1:.5f}, FNR={fnr1:.5f}"
        )

    if t2 is not None:
        TP2, FP2, TN2, FN2, fpr2, fnr2 = fpr_fnr_at_threshold(probs, labels, t2)
        t_rows.append((t2, fpr2, fnr2))
        print(
            f"[threshold2={t2:.5f}] "
            f"TP={TP2}, FP={FP2}, TN={TN2}, FN={FN2}, "
            f"FPR={fpr2:.5f}, FNR={fnr2:.5f}"
        )

    # If both thresholds are provided, print the banding rule
    band_text = None
    if (t1 is not None) and (t2 is not None):
        band_text = (
            f"Risk bands:  score <= {t1:.5f}  => LOW   |  "
            f"{t1:.5f} < score < {t2:.5f}  => MEDIUM   |  "
            f"score >= {t2:.5f}  => HIGH"
        )
        print(
            "\n[Risk bands]\n"
            f"  score <= {t1:.5f}        => LOW risk\n"
            f"  {t1:.5f} < score < {t2:.5f} => MEDIUM risk\n"
            f"  score >= {t2:.5f}        => HIGH risk\n"
        )

    # ---- Build figure with 3 vertical sections ----
    fig = plt.figure(figsize=(8, 6))
    gs = gridspec.GridSpec(
        3, 1,
        height_ratios=[4.0, 1.2, 0.8],  # top=plot, middle=table, bottom=band text
        hspace=0.4
    )

    # Top: main axes
    ax_main = fig.add_subplot(gs[0, 0])
    ax_main.plot(curve_df["threshold"], curve_df["fpr"],
                 label="FPR (false positive rate)")
    ax_main.plot(curve_df["threshold"], curve_df["fnr"],
                 color="darkgreen",
                 label="FNR (false negative rate)")

    # Vertical lines for thresholds
    if t1 is not None:
        ax_main.axvline(t1, linestyle="--", linewidth=1.5,
                        color="orange", label=f"threshold1 = {t1:.3f}")
    if t2 is not None:
        ax_main.axvline(t2, linestyle="--", linewidth=1.5,
                        color="red", label=f"threshold2 = {t2:.3f}")

    ax_main.set_xlabel("Decision threshold on P(malicious)")
    ax_main.set_ylabel("Rate")
    ax_main.set_title("FPR / FNR vs threshold")
    ax_main.set_ylim(-0.05, 1.05)
    ax_main.grid(True, linestyle="--", alpha=0.3)
    ax_main.legend(loc="upper right")

    # Middle: table axis
    ax_table = fig.add_subplot(gs[1, 0])
    ax_table.axis("off")

    if t_rows:
        row_labels = [f"thr={thr:.3f}" for (thr, _, _) in t_rows]
        cell_text = [[f"{fpr:.5f}", f"{fnr:.5f}"] for (_, fpr, fnr) in t_rows]
        col_labels = ["FPR", "FNR"]

        table = ax_table.table(
            cellText=cell_text,
            rowLabels=row_labels,
            colLabels=col_labels,
            loc="center",
            cellLoc="center",
        )
        table.scale(1.0, 1.2)

    # Bottom: risk band text axis
    ax_band = fig.add_subplot(gs[2, 0])
    ax_band.axis("off")
    if band_text is not None:
        ax_band.text(
            0.5,
            0.5,
            band_text,
            ha="center",
            va="center",
            fontsize=9,
        )

    fig_out = f"{args.output_prefix}_fpr_fnr.png"
    fig.savefig(fig_out, dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"[+] Saved FPR/FNR plot: {fig_out}")


if __name__ == "__main__":
    main()


