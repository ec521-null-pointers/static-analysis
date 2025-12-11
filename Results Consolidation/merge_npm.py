import pandas as pd
import re

# Load the data
df_heuristics = pd.read_csv("heuristics_analysis_npm.csv")
df_dynamic = pd.read_csv("dynamic_analysis_results_npm.csv")
df_static = pd.read_csv("static_batch_analysis_result_npm.csv")

# --- Universal Package Name Cleaning Function (Reinforced) ---
def normalize_package_name(name):
    """
    Standardizes a package name for merging:
    1. Lowercases the name.
    2. Converts static-batch scoped format (scope__name) to standard (@scope/name).
    3. Aggressively removes version suffixes and any trailing numbers/dashes.
    """
    if pd.isna(name):
        return None
        
    name = str(name).strip()
    
    # 1. Lowercase for consistency
    name = name.lower()
    
    # 2. Handle static batch scoped packages: scope__name -> @scope/name
    if '__' in name:
        parts = name.split('__', 1)
        name = f'@{parts[0]}/{parts[1]}'
    
    # 3. Aggressively remove version suffixes/run IDs.
    # Targets patterns like -1.0.0, @1.2.3, -8.0.5, or -1.14.1 from the end of the string.
    name = re.sub(r'[\-@_](\d+(\.\d+)*(\-.*)?)+$', '', name) 
    
    # Final cleanup: if any version removal left a trailing hyphen or dot, remove it
    name = name.strip('-').strip('.')

    return name

# --- 1. Prepare Heuristics Data ---
df_h = df_heuristics[['package_name', 'overall_score', 'risk_level']].copy()
df_h.columns = ['Package_Name', 'Heuristics_Prob', 'Heuristics_Risk_Level']
# Apply universal cleaning
df_h['Package_Name'] = df_h['Package_Name'].apply(normalize_package_name)

# --- 2. Prepare Dynamic Data ---
df_d = df_dynamic[['Package Name', 'Malicious Probability', 'Risk Level']].copy()
df_d.columns = ['Package_Name', 'Dynamic_Prob', 'Dynamic_Risk_Level']
# Apply universal cleaning
df_d['Package_Name'] = df_d['Package_Name'].apply(normalize_package_name)

# --- 3. Prepare Static Data ---
df_static['Package_Name'] = df_static['PACKAGE_NAME'].apply(normalize_package_name)
df_s = df_static[['Package_Name', 'PROB_MALICIOUS', 'RISK_LEVEL']].copy()
df_s.columns = ['Package_Name', 'Static_Prob', 'Static_Risk_Level']
df_s['Static_Prob'] = pd.to_numeric(df_s['Static_Prob'], errors='coerce')

# --- 4. Merge DataFrames ---
merged_df = pd.merge(df_h, df_d, on='Package_Name', how='outer')
merged_df = pd.merge(merged_df, df_s, on='Package_Name', how='outer')

# --- 5. Final Standardization and Output ---
risk_cols = ['Heuristics_Risk_Level', 'Dynamic_Risk_Level', 'Static_Risk_Level']
for col in risk_cols:
    merged_df[col] = merged_df[col].astype(str).str.upper().replace('NAN', 'UNKNOWN')

# Filter out rows that are entirely NaN/UNKNOWN (optional, but good practice)
merged_df.dropna(subset=['Heuristics_Prob', 'Dynamic_Prob', 'Static_Prob', 'Heuristics_Risk_Level', 'Dynamic_Risk_Level', 'Static_Risk_Level'], how='all', inplace=True)

merged_df.to_csv("merged_analysis_npm_smarter_v3.csv", index=False)
