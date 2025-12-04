import pandas as pd
import re

# Load the data
df_heuristics = pd.read_csv("heuristics_analysis_npm.csv")
df_dynamic = pd.read_csv("dynamic_analysis_results_npm.csv")
df_static = pd.read_csv("static_batch_analysis_result_npm.csv")

# --- 1. Prepare Heuristics Data ---
df_h = df_heuristics[['package_name', 'overall_score', 'risk_level']].copy()
df_h.columns = ['Package_Name', 'Heuristics_Prob', 'Heuristics_Risk_Level']

# --- 2. Prepare Dynamic Data ---
df_d = df_dynamic[['Package Name', 'Malicious Probability', 'Risk Level']].copy()
df_d.columns = ['Package_Name', 'Dynamic_Prob', 'Dynamic_Risk_Level']

# --- 3. Prepare Static Data ---
def clean_static_name(name):
    # 1. Remove the version part: -<digit>.<digit>.*$
    # e.g., 'pkg-name-1.0.0' -> 'pkg-name'
    # This also covers minor/patch versions: -1.0.0, -4.1.0, etc.
    name = re.sub(r'-\d+(\.\d+)*$', '', name)
    
    # 2. Transform scoped packages: scope__name -> @scope/name
    # e.g., 'adobe__aio-lib-ims-jwt' -> '@adobe/aio-lib-ims-jwt'
    if '__' in name:
        parts = name.split('__', 1)
        name = f'@{parts[0]}/{parts[1]}'
    return name

# Apply cleaning and select/rename columns
df_static['Package_Name'] = df_static['PACKAGE_NAME'].apply(clean_static_name)
df_s = df_static[['Package_Name', 'PROB_MALICIOUS', 'RISK_LEVEL']].copy()
df_s.columns = ['Package_Name', 'Static_Prob', 'Static_Risk_Level']

# Convert Static_Prob to numeric, coercing errors
df_s['Static_Prob'] = pd.to_numeric(df_s['Static_Prob'], errors='coerce')

# --- 4. Merge DataFrames ---
# Perform outer merges to ensure all packages from all files are included
merged_df = pd.merge(df_h, df_d, on='Package_Name', how='outer')
merged_df = pd.merge(merged_df, df_s, on='Package_Name', how='outer')

# Standardize and fill missing risk levels
risk_cols = ['Heuristics_Risk_Level', 'Dynamic_Risk_Level', 'Static_Risk_Level']
for col in risk_cols:
    # Convert to uppercase and replace any missing (NaN) values with 'UNKNOWN'
    merged_df[col] = merged_df[col].astype(str).str.upper().replace('NAN', 'UNKNOWN')

# --- 5. Output ---
merged_df.to_csv("merged_analysis_npm.csv", index=False)
