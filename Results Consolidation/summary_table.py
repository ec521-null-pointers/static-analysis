import pandas as pd
import numpy as np

# --- 1. Define Risk Maps and Thresholds ---
RISK_MAP = {'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'UNKNOWN': 0}
REVERSE_RISK_MAP = {v: k for k, v in RISK_MAP.items()}

THRESHOLDS = {
    'Heuristics': {'lm': 0.50, 'mh': 0.80},
    'Dynamic': {'lm': 0.3440, 'mh': 0.7748},
    'Static': {'lm': 0.05, 'mh': 0.20}
}
MAX_PROB = 1.0 

# --- 2. Define Helper Functions ---

def normalize_prob_score(P, lm, mh, max_prob=MAX_PROB):
    """Normalizes the probability score P to a [0, 3] range based on thresholds (Used for plotting/Max_Risk derivation)."""
    if P.isnull().all():
        return P
    P_filled = P.fillna(0.0)
    
    # Simplified piecewise function for normalization
    if mh == lm:
        conditions = [P_filled > mh]
        choices = [2.0]
        P_norm = np.select(conditions, choices, default=1.0)
    else:
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

def get_max_risk(row, analysis_columns):
    """Calculates the maximum risk level across specified analysis columns."""
    risks = []
    for col in analysis_columns:
        if col in row.index:
            risks.append(row[col])
    
    # Get max risk value (3 for HIGH, 2 for MEDIUM, 1 for LOW, 0 for UNKNOWN)
    max_risk_val = max(RISK_MAP.get(str(r).upper(), 0) for r in risks if pd.notna(r))
    return REVERSE_RISK_MAP.get(max_risk_val, 'UNKNOWN') 

def calculate_summary_stats(df, risk_col):
    """Calculates risk counts and percentages for a specific risk column."""
    risk_counts = df[risk_col].apply(lambda x: str(x).upper() if pd.notna(x) else 'UNKNOWN').value_counts().reindex(['LOW', 'MEDIUM', 'HIGH', 'UNKNOWN'], fill_value=0)
    total_classified = risk_counts[['LOW', 'MEDIUM', 'HIGH']].sum()
    
    risk_percentages = (risk_counts / total_classified) * 100 if total_classified > 0 else pd.Series(0.0, index=risk_counts.index)
    
    return risk_counts, risk_percentages, total_classified

def generate_merged_summary_table_with_max(df, analyses_list, risk_cols_map, file_name):
    """Generates the summary table including the 'Max of Analysis' row for a custom list of analyses."""
    summary_data = []
    
    # Analysis rows
    for analysis in analyses_list:
        risk_col = risk_cols_map[analysis]
        # Skip if the risk column doesn't exist (e.g., Heuristics is missing from malicious data)
        if risk_col not in df.columns:
            continue
            
        risk_counts, risk_percentages, total_classified = calculate_summary_stats(df, risk_col)
        
        row = {'Analysis type': f'{analysis} Analysis', 'Total Classified Packages': total_classified}
        for level in ['LOW', 'MEDIUM', 'HIGH']:
            count = risk_counts.get(level, 0)
            percentage = risk_percentages.get(level, 0.0)
            row[f'count of {level} (And %)'] = f"{count} ({percentage:.1f}\\%)"
        summary_data.append(row)

    # Max Risk Analysis row (uses the 'Max_Risk' column, which must be created beforehand)
    max_risk_counts, max_risk_percentages, max_total_classified = calculate_summary_stats(df, 'Max_Risk')
    max_row = {'Analysis type': 'Max of Analysis', 'Total Classified Packages': max_total_classified}
    for level in ['LOW', 'MEDIUM', 'HIGH']:
        count = max_risk_counts.get(level, 0)
        percentage = max_risk_percentages.get(level, 0.0)
        max_row[f'count of {level} (And %)'] = f"{count} ({percentage:.1f}\\%)"
    summary_data.append(max_row)

    df_summary = pd.DataFrame(summary_data)
    
    df_summary.rename(columns={
        'Total Classified Packages': 'Total Classified Packages',
        'count of LOW (And %)': 'Low (Count and \\%)',
        'count of MEDIUM (And %)': 'Medium (Count and \\%)',
        'count of HIGH (And %)': 'High (Count and \\%)' 
    }, inplace=True)
    
    # Filter out rows where 'Total Classified Packages' is 0, unless it's the Max row.
    df_summary = df_summary[
        (df_summary['Total Classified Packages'] > 0) | 
        (df_summary['Analysis type'] == 'Max of Analysis')
    ].reset_index(drop=True)

    return df_summary

def format_to_latex(df: pd.DataFrame, caption: str, label: str) -> str:
    """Formats the DataFrame into a complete LaTeX table environment with booktabs style."""
    
    # 1. Generate standard LaTeX output from pandas
    latex_output = df.to_latex(
        index=False, 
        escape=False, 
        column_format='lrrr'
    )
    
    content_lines = latex_output.split('\n')
    header_line = content_lines[2]
    data_lines = content_lines[4:-2] 
    align_match = content_lines[0].split('{')[-1].split('}')[0]

    latex_output_final = f"\\begin{{table}}[h]\n\\centering\n\\caption{{{caption}}}\n\\label{{{label}}}\n"
    latex_output_final += f"\\begin{{tabular}}{{{align_match}}}\n\\toprule\n" 

    # Add header and initial separator
    latex_output_final += header_line + "\n\\midrule\n"
    
    # Process data lines to insert \midrule for the 'Max of Analysis' row and bold the text
    table_body = []
    for line in data_lines:
        if 'Max of Analysis' in line:
            table_body.append('\\midrule') 
            bold_line = line.replace('Max of Analysis', '\\textbf{Max of Analysis}')
            table_body.append(bold_line)
        else:
            table_body.append(line)
            
    latex_output_final += '\n'.join(table_body)
    
    latex_output_final += "\n\\bottomrule\n\\end{tabular}\n\\end{table}" 
    
    return latex_output_final

# --- 3. Main Execution Block ---

# --- NPM Data Analysis ---
NPM_FILE = "merged_analysis_npm.csv"
NPM_ANALYSES = ['Heuristics', 'Dynamic', 'Static']
NPM_RISK_COLS = {
    'Heuristics': 'Heuristics_Risk_Level',
    'Dynamic': 'Dynamic_Risk_Level',
    'Static': 'Static_Risk_Level'
}

try:
    df_npm = pd.read_csv(NPM_FILE)
    
    # Calculate Max Risk
    risk_col_names_npm = [NPM_RISK_COLS[a] for a in NPM_ANALYSES]
    df_npm['Max_Risk'] = df_npm.apply(lambda row: get_max_risk(row, risk_col_names_npm), axis=1)

    # Generate NPM Summary Table DataFrame
    df_summary_npm = generate_merged_summary_table_with_max(
        df_npm, NPM_ANALYSES, NPM_RISK_COLS, NPM_FILE
    )
    
    # Generate LaTeX Table
    latex_table_npm = format_to_latex(
        df_summary_npm, 
        "Summary of Risk Classification for npm Packages (NPM Dataset)", 
        "tab:npm_summary_merged"
    )
    print(f"\n--- LaTeX Table 1: {NPM_FILE} ---\n{latex_table_npm}")

except FileNotFoundError:
    print(f"Error: {NPM_FILE} not found. Cannot generate NPM table.")


# --- Malicious Data Analysis ---
MALICIOUS_FILE = "merged_analysis_malicious_smarter.csv"
# Only Dynamic and Static columns are reliable in this dataset based on context
MALICIOUS_ANALYSES = ['Dynamic', 'Static']
MALICIOUS_RISK_COLS = {
    'Dynamic': 'Dynamic_Risk_Level',
    'Static': 'Static_Risk_Level'
}

try:
    df_malicious = pd.read_csv(MALICIOUS_FILE)

    # Calculate Max Risk (only using Dynamic and Static for this file)
    malicious_risk_col_names = [MALICIOUS_RISK_COLS[a] for a in MALICIOUS_ANALYSES]
    df_malicious['Max_Risk'] = df_malicious.apply(lambda row: get_max_risk(row, malicious_risk_col_names), axis=1)

    # Generate Malicious Summary Table DataFrame
    df_summary_malicious = generate_merged_summary_table_with_max(
        df_malicious, MALICIOUS_ANALYSES, MALICIOUS_RISK_COLS, MALICIOUS_FILE
    )

    # Generate LaTeX Table
    latex_table_malicious = format_to_latex(
        df_summary_malicious, 
        "Summary of Risk Classification for Malicious Packages (Malicious Dataset)", 
        "tab:malicious_summary_merged"
    )
    print(f"\n--- LaTeX Table 2: {MALICIOUS_FILE} ---\n{latex_table_malicious}")

except FileNotFoundError:
    print(f"Error: {MALICIOUS_FILE} not found. Cannot generate Malicious table.")
