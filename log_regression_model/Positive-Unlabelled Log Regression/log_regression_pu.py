#!/usr/bin/env python3
"""
log_regression_linear.py

Manual logistic regression using ALL numeric features, linear decision boundary.

Data:
  - malicious_features.csv  (label = 1, known malicious)
  - good_feature.csv        (label = 0, assumed good / unlabeled)

Key ideas:
  * Positives (1) are trusted → higher loss weight.
  * Negatives (0) are only assumed good → lower loss weight.
  * Threshold chosen so that only ~X% of 'good' are flagged as suspicious.

Outputs:
  * Confusion matrix & metrics at threshold 0.5 (reference).
  * Confusion matrix & metrics at chosen threshold
      (based on --target-good-flag, e.g. 5% of good flagged).
  * Figure 1: probability vs signed-log(score) (PNG).
  * CSV: index, logit_score (signed-log), prob_malicious, label.
  * Model parameters: weights, bias, normalization stats (.npy files).
"""

import argparse
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt


# ----------------- core utilities -----------------

def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-z))


def train_logistic_regression(
    X,
    y,
    lr=0.1,
    max_iter=2000,
    l2_reg=0.0,
    pos_weight=5.0,
    neg_weight=1.0,
    verbose=True,
):
    """
    Weighted logistic regression:
      * y in {0,1}
      * pos_weight applied to malicious (1)
      * neg_weight applied to 'good' (0)
    """
    n_samples, n_features = X.shape
    w = np.zeros(n_features, dtype=float)
    b = 0.0

    for i in range(max_iter):
        scores = X @ w + b
        y_hat = sigmoid(scores)

        # class-weighted error
        weights = np.where(y == 1.0, pos_weight, neg_weight)
        weighted_error = weights * (y_hat - y)

        grad_w = (X.T @ weighted_error) / n_samples + l2_reg * w
        grad_b = weighted_error.mean()

        w -= lr * grad_w
        b -= lr * grad_b

        if verbose and (i % 200 == 0 or i == max_iter - 1):
            eps = 1e-12
            loss = -np.mean(
                weights * (y * np.log(y_hat + eps) +
                           (1 - y) * np.log(1 - y_hat + eps))
            ) + 0.5 * l2_reg * np.sum(w ** 2)
            print(f"[iter {i:4d}] loss = {loss:.4f}")

    return w, b


def choose_threshold_by_good_flag_rate(probs, y_true, target_rate=0.05):
    """
    Choose a threshold such that at most target_rate of 'good' (label=0)
    are flagged as suspicious, and among those, we maximize recall on label=1.

    Returns:
      threshold, stats_dict
        stats_dict: {
           'threshold', 'flag_good', 'flag_good_rate',
           'flag_mal', 'tpr'
        }
    """
    y_true = np.asarray(y_true).astype(int)
    probs = np.asarray(probs)

    good_mask = (y_true == 0)
    mal_mask = (y_true == 1)

    good_probs = probs[good_mask]
    mal_probs = probs[mal_mask]

    n_good = good_mask.sum()
    n_mal = mal_mask.sum()

    thresholds = np.unique(probs)[::-1]  # descending probs
    best = None

    for thr in thresholds:
        flag_good = (good_probs >= thr).sum()
        rate = flag_good / (n_good + 1e-12)

        if rate <= target_rate:
            flag_mal = (mal_probs >= thr).sum()
            tpr = flag_mal / (n_mal + 1e-12)

            if best is None or tpr > best["tpr"]:
                best = {
                    "threshold": float(thr),
                    "flag_good": int(flag_good),
                    "flag_good_rate": float(rate),
                    "flag_mal": int(flag_mal),
                    "tpr": float(tpr),
                }

    # Fallback if no threshold achieves that low rate
    if best is None:
        thr = 0.5
        flag_good = (good_probs >= thr).sum()
        rate = flag_good / (n_good + 1e-12)
        flag_mal = (mal_probs >= thr).sum()
        tpr = flag_mal / (n_mal + 1e-12)
        best = {
            "threshold": float(thr),
            "flag_good": int(flag_good),
            "flag_good_rate": float(rate),
            "flag_mal": int(flag_mal),
            "tpr": float(tpr),
        }

    return best["threshold"], best


def load_feature_matrices(malicious_path: str, good_path: str):
    """
    Load CSVs, find common numeric columns, return X_mal, X_good, feature_names.
    """
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


# ----------------- main -----------------

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
    parser.add_argument("--pos-weight", type=float, default=5.0,
                        help="Loss weight for malicious (label=1)")
    parser.add_argument("--neg-weight", type=float, default=1.0,
                        help="Loss weight for assumed-good (label=0)")
    parser.add_argument("--target-good-flag", type=float, default=0.05,
                        help="Target fraction of 'good' flagged as suspicious")
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
          f"({X_mal.shape[0]} malicious, {X_good.shape[0]} assumed-good)")

    # 2. Standardize
    X_mean = X.mean(axis=0, keepdims=True)
    X_std = X.std(axis=0, keepdims=True)
    X_std[X_std == 0] = 1.0
    X_std[X_std == np.inf] = 1.0
    X_norm = (X - X_mean) / X_std

    # 3. Train weighted logistic regression
    w, b = train_logistic_regression(
        X_norm,
        y,
        lr=args.lr,
        max_iter=args.max_iter,
        l2_reg=args.l2_reg,
        pos_weight=args.pos_weight,
        neg_weight=args.neg_weight,
        verbose=True,
    )
    print("[+] Training finished.")
    print(f"    ||w|| = {np.linalg.norm(w):.4f}, b = {b:.4f}")

    # 4. Logits & probabilities
    raw_scores = X_norm @ w + b
    probs = sigmoid(raw_scores)

    # Signed log-compressed scores for plotting / CSV
    norm_scores = np.sign(raw_scores) * np.log1p(np.abs(raw_scores))

    # ---------- Metrics at threshold = 0.5 (reference) ----------
    thr_default = 0.5
    y_pred_default = (probs >= thr_default).astype(int)

    TP = np.sum((y_int == 1) & (y_pred_default == 1))
    TN = np.sum((y_int == 0) & (y_pred_default == 0))
    FP = np.sum((y_int == 0) & (y_pred_default == 1))
    FN = np.sum((y_int == 1) & (y_pred_default == 0))

    total = len(y_int)
    acc = (TP + TN) / total
    precision = TP / (TP + FP + 1e-12)
    recall = TP / (TP + FN + 1e-12)
    fpr = FP / (FP + TN + 1e-12)
    fnr = FN / (FN + TP + 1e-12)

    print("\n==== METRICS at threshold = 0.5 (reference) ====")
    print(f"TP={TP}, FN={FN}, TN={TN}, FP={FP}")
    print(f"Accuracy:            {acc:.4f}")
    print(f"Precision (PPV):     {precision:.4f}")
    print(f"Recall (TPR):        {recall:.4f}")
    print(f"False Positive Rate: {fpr:.4f} (vs assumed-good)")
    print(f"False Negative Rate: {fnr:.4f}")
    print("=================================================")

    # ---------- Threshold based on 'good' flag rate ----------
    target_rate = args.target_good_flag
    best_thr, stats = choose_threshold_by_good_flag_rate(
        probs, y_int, target_rate=target_rate
    )

    print(f"\n[+] Threshold chosen for target-good-flag={target_rate*100:.2f}%")
    print(f"    threshold = {best_thr:.6f}")
    print(f"    good flagged: {stats['flag_good']} "
          f"({stats['flag_good_rate']*100:.2f}% of assumed-good)")
    print(f"    known malicious caught: {stats['flag_mal']} "
          f"({stats['tpr']*100:.2f}% of known-malicious)")

    # Recompute confusion matrix at best_thr
    y_pred_best = (probs >= best_thr).astype(int)
    TP_b = np.sum((y_int == 1) & (y_pred_best == 1))
    TN_b = np.sum((y_int == 0) & (y_pred_best == 0))
    FP_b = np.sum((y_int == 0) & (y_pred_best == 1))
    FN_b = np.sum((y_int == 1) & (y_pred_best == 0))

    acc_b = (TP_b + TN_b) / total
    precision_b = TP_b / (TP_b + FP_b + 1e-12)
    recall_b = TP_b / (TP_b + FN_b + 1e-12)
    fpr_b = FP_b / (FP_b + TN_b + 1e-12)
    fnr_b = FN_b / (FN_b + TP_b + 1e-12)

    print("\n==== METRICS at chosen threshold (good-flag rate) ====")
    print(f"Threshold:           {best_thr:.6f}")
    print(f"TP={TP_b}, FN={FN_b}, TN={TN_b}, FP={FP_b}")
    print(f"Accuracy:            {acc_b:.4f}")
    print(f"Precision (PPV):     {precision_b:.4f}")
    print(f"Recall (TPR):        {recall_b:.4f}")
    print(f"False Positive Rate: {fpr_b:.4f} (vs assumed-good)")
    print(f"False Negative Rate: {fnr_b:.4f}")
    print("======================================================\n")

    # 5. Plot Figure 1 using norm_scores
    sort_idx = np.argsort(norm_scores)
    scores_sorted = norm_scores[sort_idx]
    probs_sorted = probs[sort_idx]
    y_sorted = y_int[sort_idx]

    plt.figure(figsize=(8, 5))
    plt.plot(scores_sorted, probs_sorted, linewidth=2,
             label="P(malicious | score)")

    good_mask = (y_sorted == 0)
    mal_mask = (y_sorted == 1)
    plt.scatter(scores_sorted[good_mask], np.full(good_mask.sum(), -0.02),
                alpha=0.4, marker="o", label="Assumed-good (label=0)")
    plt.scatter(scores_sorted[mal_mask], np.full(mal_mask.sum(), 1.02),
                alpha=0.4, marker="x", label="Malicious (label=1)")

    plt.axvline(0.0, linestyle="--", label="Decision boundary (score = 0)")
    plt.xlabel("Signed log score: sign(s) * log(1 + |s|), s = w^T x + b")
    plt.ylabel("P(malicious | x)")
    plt.ylim(-0.1, 1.1)
    plt.title("Linear Logistic Regression: probability vs signed-log score")
    plt.legend(loc="best")
    plt.tight_layout()
    fig_path = f"{args.output_prefix}_figure1_prob_vs_score.png"
    plt.savefig(fig_path, dpi=150)
    print(f"[+] Saved figure: {fig_path}")
    plt.show()

    # 6. Save CSV for Figure 1
    out_df = pd.DataFrame({
        "index": np.arange(len(y_int)),
        "logit_score": norm_scores,
        "prob_malicious": probs,
        "label": y_int,
    })
    csv_path = f"{args.output_prefix}_figure1_data.csv"
    out_df.to_csv(csv_path, index=False)
    print(f"[+] Saved CSV data for Figure 1: {csv_path}")

    # 7. Save model parameters
    np.save(f"{args.output_prefix}_theta_weights.npy", w)
    np.save(f"{args.output_prefix}_theta_bias.npy", b)
    np.save(f"{args.output_prefix}_norm_mean.npy", X_mean)
    np.save(f"{args.output_prefix}_norm_std.npy", X_std)
    print(f"[+] Saved model parameters (theta, normalization).")


if __name__ == "__main__":
    main()

