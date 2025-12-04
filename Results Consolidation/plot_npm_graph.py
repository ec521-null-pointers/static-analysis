import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# --- 1. Aesthetic Changes: Font size and Figure size (Maximized for slides) ---
# Set the global font size to 36 for high visibility
plt.rcParams.update({'font.size': 36})
fig, ax = plt.subplots(figsize=(14, 16)) # Large figure size for wide/tall presentation

# Load the merged data
try:
    df = pd.read_csv("merged_analysis_npm.csv")
except FileNotFoundError:
    print("Error: merged_analysis_npm.csv not found.")
    # In a real script, you'd handle exit or raise error here

# --- 2. Define Thresholds and Columns ---
THRESHOLDS = {
    'Heuristics': {'lm': 0.50, 'mh': 0.80},
    'Dynamic': {'lm': 0.3440, 'mh': 0.7748},
    'Static': {'lm': 0.05, 'mh': 0.20}
}
MAX_PROB = 1.0 

ANALYSES = ['Heuristics', 'Dynamic', 'Static']
PROB_COLS = {
    'Heuristics': 'Heuristics_Prob',
    'Dynamic': 'Dynamic_Prob',
    'Static': 'Static_Prob'
}
RISK_COLS = {
    'Heuristics': 'Heuristics_Risk_Level',
    'Dynamic': 'Dynamic_Risk_Level',
    'Static': 'Static_Risk_Level'
}

# --- 3. Define Normalization Function ---
def normalize_prob_score(P, lm, mh, max_prob=MAX_PROB):
    """Normalizes a risk probability score (P) to a 0-3 scale."""
    if P.isnull().all():
        return P

    P_filled = P.fillna(0.0) 
    
    # Define piecewise linear segments for normalization
    low_segment = 1.0 * (P_filled / lm)
    medium_segment = 1.0 + 1.0 * (P_filled - lm) / (mh - lm)
    high_segment = 2.0 + 1.0 * (P_filled - mh) / (max_prob - mh)

    conditions = [
        P_filled <= lm,
        (P_filled > lm) & (P_filled <= mh),
        P_filled > mh
    ]
    choices = [low_segment, medium_segment, high_segment]
    
    P_norm = np.select(conditions, choices, default=np.nan)
    
    P_norm = pd.Series(P_norm, index=P.index)
    P_norm[P.isna()] = np.nan
    
    return P_norm

# Apply normalization
for analysis in ANALYSES:
    lm = THRESHOLDS[analysis]['lm']
    mh = THRESHOLDS[analysis]['mh']
    df[f'{analysis}_Prob_Norm'] = normalize_prob_score(df[PROB_COLS[analysis]], lm, mh)

# --- 4. Calculate Max Risk Level and Fractional Counts ---
RISK_MAP = {'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'UNKNOWN': 0}
RISK_MAP_INV = {1: 'LOW', 2: 'MEDIUM', 3: 'HIGH', 0: 'UNKNOWN'}

def get_max_risk(row):
    """Calculates the maximum risk level across all analyses for a package."""
    risks = [row[RISK_COLS[a]] for a in ANALYSES]
    max_risk_val = max(RISK_MAP.get(str(r).upper(), 0) for r in risks if pd.notna(r))
    return RISK_MAP_INV.get(max_risk_val, 'UNKNOWN')

df['Max_Risk'] = df.apply(get_max_risk, axis=1)

total_rows = len(df)
max_risk_counts = df['Max_Risk'].value_counts()
max_risk_fractions = max_risk_counts.reindex(['LOW', 'MEDIUM', 'HIGH'], fill_value=0) / total_rows

bar_colors = {'LOW': 'green', 'MEDIUM': 'orange', 'HIGH': 'red'}
bar_segments = {'LOW': (0, 1), 'MEDIUM': (1, 2), 'HIGH': (2, 3)} 

# --- 5. Plotting ---
plt.style.use('ggplot')

# 5a. Background Bar Chart (Max Risk Fractions)
for risk_level in ['LOW', 'MEDIUM', 'HIGH']:
    x_start, x_end = bar_segments[risk_level]
    height = max_risk_fractions.get(risk_level, 0.0)
    
    if height > 0:
        ax.bar(
            x_start + 0.5, 
            height,
            width=x_end - x_start, 
            color=bar_colors[risk_level],
            alpha=0.15,
            bottom=0,
            align='center',
            label=f'Max Risk Fraction: {risk_level}'
        )
        # Add text labels on the bar
        ax.text(x_start + 0.5, height / 2, 
                 f'Max Risk: {risk_level}\n({height:.1%})', 
                 ha='center', va='center', color='black', fontsize=28, weight='bold')

# 5b. S-Curves (Cumulative Distribution) and Red X's
for analysis in ANALYSES:
    norm_col = f'{analysis}_Prob_Norm'
    
    scores_norm = df[norm_col].dropna().sort_values().values
    n_scores = len(scores_norm)
    y_cum = np.arange(1, n_scores + 1) / n_scores
    
    # Plot S-Curve, keep label for the legend
    line, = ax.plot(scores_norm, y_cum, label=f'{analysis} Analysis', linewidth=4)
    line_color = line.get_color()
    
    lm_norm = 1.0
    mh_norm = 2.0
    
    # Vertical Threshold Lines: Remove label for legend simplification
    ax.axvline(x=lm_norm, color=line_color, linestyle='--', alpha=0.7, linewidth=2)
    ax.axvline(x=mh_norm, color=line_color, linestyle=':', alpha=0.7, linewidth=2)

    # Red 'X' Markers: Remove label for legend simplification
    risk_col = RISK_COLS[analysis]
    low_prob_high_risk = df[
        (df[norm_col] <= lm_norm) & 
        (df[risk_col].str.upper() == 'HIGH')
    ].dropna(subset=[norm_col, risk_col])
    
    if not low_prob_high_risk.empty:
        flagged_scores_norm = low_prob_high_risk[norm_col].values
        flagged_y_pos = []
        
        for score in flagged_scores_norm:
            index = np.searchsorted(scores_norm, score, side='right') - 1
            if index >= 0:
                 flagged_y_pos.append(y_cum[index])
            else:
                 flagged_y_pos.append(0.0)

        ax.scatter(flagged_scores_norm, flagged_y_pos, 
                   marker='x', color='red', s=200, linewidth=4, zorder=5)

# --- 6. Final Touches ---
ax.set_title('Normalized Risk Probability Distribution', fontsize=40)
ax.set_xlabel('Normalized Risk Score', fontsize=38)
ax.set_ylabel('Cumulative Fraction of Packages', fontsize=38)
ax.tick_params(axis='both', which='major', labelsize=32)
ax.set_xticks([0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0])
ax.set_xlim(0, 3.1)
ax.set_ylim(0, 1.05)
ax.grid(True, which='both', linestyle='--', linewidth=0.5, alpha=0.7)

# --- 7. Custom Legend Construction (Simplified and Center Right) ---
# Create placeholder handles for generic thresholds
low_thresh_handle = ax.plot([], [], color='gray', linestyle='--', linewidth=3, label='Low Threshold (Normalized)')[0]
high_thresh_handle = ax.plot([], [], color='gray', linestyle=':', linewidth=3, label='High Threshold (Normalized)')[0]

# Get auto-generated handles/labels (S-Curves and Max Risk Fraction bars)
handles, labels = ax.get_legend_handles_labels()

# Filter to keep only S-Curves and Max Risk Fractions
unique_labels = {}
for h, l in zip(handles, labels):
    if 'Analysis' in l or 'Max Risk' in l:
        unique_labels[l] = h

# Add custom threshold handles
unique_labels['Low Threshold (Normalized)'] = low_thresh_handle
unique_labels['High Threshold (Normalized)'] = high_thresh_handle

# Plot the final custom legend
ax.legend(unique_labels.values(), unique_labels.keys(), loc='center right', fontsize=28)

plt.tight_layout()
plt.savefig("normalized_analysis_s_curve_slides_simplified_legend_final.png")
