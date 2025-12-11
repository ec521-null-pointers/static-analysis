import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Patch
import os

# --- 1. Define Plotting Logic in a Function ---
def plot_analysis(input_csv_path, output_png_path, title):
    """
    Plots the normalized risk probability distribution from an analysis CSV.
    """
    # --- 1. Aesthetic Changes: Font size and Figure size ---
    plt.rcParams.update({'font.size': 36})
    fig, ax = plt.subplots(figsize=(14, 16)) 

    # Load the data
    try:
        df = pd.read_csv(input_csv_path)
    except FileNotFoundError:
        print(f"Error: Input file '{input_csv_path}' not found.")
        return
    
    # Check if DataFrame is empty
    if df.empty:
        print("Warning: Input DataFrame is empty. Cannot generate plot.")
        return

    # --- 2. Define Thresholds and Columns ---
    # NOTE: The analyses list must match the columns in your CSV.
    ANALYSES = [
        col.replace('_Prob', '') 
        for col in df.columns if col.endswith('_Prob')
    ]
    
    THRESHOLDS = {
        'Heuristics': {'lm': 0.50, 'mh': 0.80},
        'Dynamic': {'lm': 0.3440, 'mh': 0.7748},
        'Static': {'lm': 0.05, 'mh': 0.20}
    }
    MAX_PROB = 1.0 

    PROB_COLS = {a: f'{a}_Prob' for a in ANALYSES}
    RISK_COLS = {a: f'{a}_Risk_Level' for a in ANALYSES}

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

    # --- 4. Data Cleaning and Preprocessing ---
    RISK_MAP = {'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'UNKNOWN': 0}
    RISK_MAP_INV = {1: 'LOW', 2: 'MEDIUM', 3: 'HIGH', 0: 'UNKNOWN'}

    # Cleaning step: Treat NaN/blank risk levels as 'UNKNOWN'
    for analysis in ANALYSES:
        risk_col = RISK_COLS.get(analysis)
        if risk_col in df.columns:
            # Convert to string, strip whitespace, convert to uppercase, and replace various forms of blank/unknown
            df[risk_col] = df[risk_col].astype(str).str.strip().str.upper()
            df[risk_col] = df[risk_col].replace({'NAN': 'UNKNOWN', '': 'UNKNOWN', ' ': 'UNKNOWN', 'NULL': 'UNKNOWN'}).fillna('UNKNOWN')
            
            # Ensure the probability column is numeric before normalization
            prob_col = PROB_COLS.get(analysis)
            if prob_col in df.columns:
                df[prob_col] = pd.to_numeric(df[prob_col], errors='coerce')


    # Apply normalization (only if the column exists in the CSV)
    for analysis in ANALYSES:
        prob_col = PROB_COLS.get(analysis)
        if prob_col in df.columns and analysis in THRESHOLDS:
            lm = THRESHOLDS[analysis]['lm']
            mh = THRESHOLDS[analysis]['mh']
            df[f'{analysis}_Prob_Norm'] = normalize_prob_score(df[prob_col], lm, mh)
        else:
            print(f"Warning: Missing required columns for {analysis} analysis.")


    # Calculate Max Risk Level (only considers available analyses)
    def get_max_risk(row):
        """Calculates the maximum risk level across all analyses for a package."""
        risks = [row[RISK_COLS[a]] for a in ANALYSES if RISK_COLS[a] in row and a in ANALYSES]
        # Max risk is calculated from the numerical mapping
        max_risk_val = max(RISK_MAP.get(r, 0) for r in risks)
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
            )
            # Add text labels on the bar
            ax.text(x_start + 0.5, height / 2, 
                    f'Max Risk: {risk_level}\n({height:.1%})', 
                    ha='center', va='center', color='black', fontsize=28, weight='bold')

    # 5b. S-Curves (Cumulative Distribution) and Red X's
    x_marker_plotted = False
    x_marker_label = 'Low/Medium Score, High Risk Package'
    
    for analysis in ANALYSES:
        norm_col = f'{analysis}_Prob_Norm'
        risk_col = RISK_COLS.get(analysis)
        
        # Check if the required normalized column exists and has data to plot
        if norm_col not in df.columns:
            continue
            
        scores_norm = df[norm_col].dropna().sort_values().values
        n_scores = len(scores_norm)
        
        # If no scores are available for this analysis, skip plotting (correct conditional logic)
        if n_scores == 0:
            continue
            
        y_cum = np.arange(1, n_scores + 1) / n_scores
        
        # Plot S-Curve
        line, = ax.plot(scores_norm, y_cum, label=f'{analysis} Analysis', linewidth=4)
        line_color = line.get_color()
        
        lm_norm = 1.0
        mh_norm = 2.0
        
        # Vertical Threshold Lines
        ax.axvline(x=lm_norm, color=line_color, linestyle='--', alpha=0.7, linewidth=2)
        ax.axvline(x=mh_norm, color=line_color, linestyle=':', alpha=0.7, linewidth=2)

        # Red 'X' Markers (Low Prob, High Risk packages flagged)
        if risk_col and risk_col in df.columns:
            low_prob_high_risk = df[
                (df[norm_col] <= mh_norm) & 
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

                # Plot only if there are points
                if flagged_scores_norm.size > 0:
                    # Only label the first time for the legend
                    label = x_marker_label if not x_marker_plotted else "_nolegend_"
                    ax.scatter(flagged_scores_norm, flagged_y_pos, 
                               marker='x', color='red', s=200, linewidth=4, zorder=5, label=label)
                    x_marker_plotted = True

    # --- 6. Final Touches ---
    ax.set_title(title, fontsize=40)
    ax.set_xlabel('Normalized Risk Score', fontsize=38)
    ax.set_ylabel('Cumulative Fraction of Packages', fontsize=38)
    ax.tick_params(axis='both', which='major', labelsize=32)
    ax.set_xticks([0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0])
    ax.set_xlim(0, 3.1)
    ax.set_ylim(0, 1.05)
    ax.grid(True, which='both', linestyle='--', linewidth=0.5, alpha=0.7)

    # --- 7. Custom Legend Construction ---
    low_thresh_handle = ax.plot([], [], color='gray', linestyle='--', linewidth=3, label='Low Threshold (Normalized)')[0]
    high_thresh_handle = ax.plot([], [], color='gray', linestyle=':', linewidth=3, label='High Threshold (Normalized)')[0]

    handles, labels = ax.get_legend_handles_labels()

    # Filter to keep only S-Curves and Red X marker
    unique_labels = {}
    for h, l in zip(handles, labels):
        if 'Analysis' in l or l == x_marker_label:
            unique_labels[l] = h

    # Add custom threshold handles and Max Risk info
    unique_labels['Low Threshold (Normalized)'] = low_thresh_handle
    unique_labels['High Threshold (Normalized)'] = high_thresh_handle
    unique_labels['Max Risk: LOW/MED/HIGH'] = Patch(color='gray', alpha=0.15, label='Max Risk: LOW/MED/HIGH')

    ax.legend(unique_labels.values(), unique_labels.keys(), loc='upper left', fontsize=28)

    plt.tight_layout()
    plt.savefig(output_png_path)
    print(f"Plot saved as {output_png_path}")

# --- Execution Example ---
input_file = "merged_analysis_malicious_smarter.csv" # Using the file from the previous context
output_file = "normalized_analysis_s_curve_good_custom.png"
plot_title = "Malicious Packages"

# You can now use this function with different CSV files:
# plot_analysis("merged_analysis_malicious_smarter.csv", "normalized_analysis_s_curve_malicious_custom.png", "Normalized Risk Probability Distribution (Malicious Packages)")

plot_analysis(input_file, output_file, plot_title)
