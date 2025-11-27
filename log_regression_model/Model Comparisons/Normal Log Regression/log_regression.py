#!/usr/bin/env python3
"""
log_regression.py

Manual (no sklearn) logistic regression using ALL numeric features,
with a linear decision boundary in feature space.

Data:
  - malicious_features.csv  (label = 1)
  - good_feature.csv        (label = 0)

Outputs:
  * Confusion matrix + metrics (printed)
  * Figure 1: probability vs normalized logit score (PNG)
  * CSV with data used for Figure 1:
        index, logit_score, prob_malicious, label
  * Model parameters: weights, bias, normalization stats
"""

import argparse
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt


def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-z))


def train_logistic_regression(X, y, lr=0.1, max_iter=2000, l2_reg=0.0, verbose=True):
    """
    X: (n_samples, n_features)
    y: (n_samples,), values in {0,1}
    Returns w, b
    """
    n_samples, n_features = X.shape
    w = np.zeros(n_features, dtype=float)
    b = 0.0

    for i in range(max_iter):
        scores = X @ w + b
        y_hat = sigmoid(scores)

        error = y_hat - y
        grad_w = (X.T @ error) / n_samples + l2_reg * w
        grad_b = error.mean()

        w -= lr * grad_w
        b -= lr * grad_b

        if verbose and (i % 200 == 0 or i == max_iter - 1):
            eps = 1e-12
            loss = -np.mean(
                y * np.log(y_hat + eps) + (1 - y) * np.log(1 - y_hat + eps)
            ) + 0.5 * l2_reg * np.sum(w ** 2)
            print(f"[iter {i:4d}] loss = {loss:.4f}")

    return w, b


def load_feature_matrices(malicious_path: str, good_path: str):
    """Load CSVs, find common numeric columns, return X_mal, X_good, feature_names."""
    df_mal = pd.read_csv(malicious_path)
    df_good = pd.read_csv(good_path)

    common_cols = [
        c for c in df_mal.columns
        if c in df_good.columns and c != "PACKAGE_NAME"
    ]
    if not common_cols:
        raise ValueError("No common columns between malicious and good CSVs.")

    numeric_cols = []
    for c in common_cols:
        try:
            pd.to_numeric(df_mal[c], errors="raise")
            pd.to_numeric(df_good[c], errors="raise")
            numeric_cols.append(c)
        except Exception:
            pass

    if not numeric_cols:
        raise ValueError("No numeric common columns to use as features.")

    X_mal = df_mal[numeric_cols].apply(pd.to_numeric, errors="coerce").fillna(0).values
    X_good = df_good[numeric_cols].apply(pd.to_numeric, errors="coerce").fillna(0).values

    print(f"[+] Using {len(numeric_cols)} numeric feature columns.")
    return X_mal, X_good, numeric_cols


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--malicious",
        default="/mnt/data/malicious_features.csv",
        help="Path to malicious features CSV",
    )
    parser.add_argument(
        "--good",
        default="/mnt/data/good_feature.csv",
        help="Path to good features CSV",
    )
    parser.add_argument(
        "--output-prefix",
        default="log_regression_linear",
        help="Prefix for output files",
    )
    parser.add_argument("--lr", type=float, default=0.1, help="Learning rate")
    parser.add_argument("--max-iter", type=int, default=2000, help="Max iterations")
    parser.add_argument("--l2-reg", type=float, default=0.0, help="L2 regularization")
    args = parser.parse_args()

    # 1. Load data
    X_mal, X_good, feature_names = load_feature_matrices(args.malicious, args.good)
    X = np.vstack([X_mal, X_good])
    y = np.concatenate([
        np.ones(X_mal.shape[0], dtype=float),
        np.zeros(X_good.shape[0], dtype=float),
    ])
    y_int = y.astype(int)

    print(f"[+] Total samples: {X.shape[0]} "
          f"({X_mal.shape[0]} malicious, {X_good.shape[0]} good)")

    # 2. Standardize
    X_mean = X.mean(axis=0, keepdims=True)
    X_std = X.std(axis=0, keepdims=True)
    X_std[X_std == 0] = 1.0
    X_std[X_std == np.inf] = 1.0
    X_norm = (X - X_mean) / X_std

    # 3. Train linear logistic regression on X_norm
    w, b = train_logistic_regression(
        X_norm,
        y,
        lr=args.lr,
        max_iter=args.max_iter,
        l2_reg=args.l2_reg,
        verbose=True,
    )
    print("[+] Training finished.")
    print(f"    ||w|| = {np.linalg.norm(w):.4f}, b = {b:.4f}")

    # 4. Raw logits & probabilities
    logit_scores = X_norm @ w + b
    probs = sigmoid(logit_scores)

    # 5. Normalized logits for plotting / CSV
    w_norm = np.linalg.norm(w) + 1e-12
    norm_scores = logit_scores / w_norm

    # 6. Confusion matrix & metrics at threshold 0.5
    threshold = 0.5
    y_pred = (probs >= threshold).astype(int)

    TP = np.sum((y_int == 1) & (y_pred == 1))
    TN = np.sum((y_int == 0) & (y_pred == 0))
    FP = np.sum((y_int == 0) & (y_pred == 1))
    FN = np.sum((y_int == 1) & (y_pred == 0))

    total = len(y_int)
    acc = (TP + TN) / total
    precision = TP / (TP + FP + 1e-12)
    recall = TP / (TP + FN + 1e-12)
    fpr = FP / (FP + TN + 1e-12)
    fnr = FN / (FN + TP + 1e-12)

    print("\n================ CONFUSION MATRIX ================")
    print(f"              Pred 0      Pred 1")
    print(f"Actual 0   |   {TN:5d}       {FP:5d}")
    print(f"Actual 1   |   {FN:5d}       {TP:5d}")
    print("==================================================")

    print("\n================ METRICS SUMMARY =================")
    print(f"Total samples:        {total}")
    print(f"Malicious (1):        {np.sum(y_int==1)}")
    print(f"Good (0):             {np.sum(y_int==0)}")
    print("--------------------------------------------------")
    print(f"Accuracy:             {acc:.4f}")
    print(f"Precision (PPV):      {precision:.4f}")
    print(f"Recall (TPR):         {recall:.4f}")
    print(f"False Positive Rate:  {fpr:.4f}")
    print(f"False Negative Rate:  {fnr:.4f}")
    print("==================================================\n")

    # 7. Sort by normalized score for Figure 1
    sort_idx = np.argsort(norm_scores)
    scores_sorted = norm_scores[sort_idx]
    probs_sorted = probs[sort_idx]
    y_sorted = y_int[sort_idx]

    # 8. Plot Figure 1
    plt.figure(figsize=(8, 5))
    plt.plot(scores_sorted, probs_sorted, linewidth=2,
             label="P(malicious | score)")

    good_mask = (y_sorted == 0)
    mal_mask = (y_sorted == 1)
    plt.scatter(scores_sorted[good_mask], np.full(good_mask.sum(), -0.02),
                alpha=0.4, marker="o", label="Good (label=0)")
    plt.scatter(scores_sorted[mal_mask], np.full(mal_mask.sum(), 1.02),
                alpha=0.4, marker="x", label="Malicious (label=1)")

    plt.axvline(0.0, linestyle="--", label="Decision boundary (score = 0)")
    plt.xlabel("Normalized model logit score ( (w^T x + b) / ||w|| )")
    plt.ylabel("P(malicious | x)")
    plt.ylim(-0.1, 1.1)
    plt.title("Linear Logistic Regression: probability vs normalized score")
    plt.legend(loc="best")
    plt.tight_layout()
    fig_path = f"{args.output_prefix}_figure1_prob_vs_score.png"
    plt.savefig(fig_path, dpi=150)
    print(f"[+] Saved figure: {fig_path}")
    plt.show()

    # 9. Save CSV with Figure 1 data
    out_df = pd.DataFrame({
        "index": np.arange(len(y_int)),
        "logit_score": norm_scores,       # x-axis used in the plot
        "prob_malicious": probs,          # aligned 0–1 score
        "label": y_int,
    })
    csv_path = f"{args.output_prefix}_figure1_data.csv"
    out_df.to_csv(csv_path, index=False)
    print(f"[+] Saved CSV data for Figure 1: {csv_path}")

    # 10. Save model parameters for later classification
    np.save(f"{args.output_prefix}_theta_weights.npy", w)
    np.save(f"{args.output_prefix}_theta_bias.npy", b)
    np.save(f"{args.output_prefix}_norm_mean.npy", X_mean)
    np.save(f"{args.output-prefix}_norm_std.npy", X_std)  # <-- FIX BELOW
    print(f"[+] Saved model parameters (theta, normalization).")


if __name__ == "__main__":
    main()

