import pandas as pd
import re
import os

# --- Package Name Cleaning Functions ---

def clean_dynamic_name(name):
    """Cleans dynamic package names by removing the trailing @version suffix."""
    if pd.isna(name):
        return name
    name_str = str(name).strip()
    # Remove @version suffix (e.g., package@1.0.2 -> package)
    return re.sub(r"@[\d\.]+$", "", name_str).strip()

def clean_static_name(name):
    """
    Cleans static package names by:
    1. Normalizing scoped package separators (e.g., @scope@package -> @scope/package).
    2. Normalizing other separators (e.g., package__sub -> package/sub).
    3. Removing trailing versions separated by a hyphen (e.g., package-4.16.0 -> package).
    """
    if pd.isna(name):
        return name
    name_str = str(name).strip()
    
    # 1. Normalize scoped package separators: @scope@package -> @scope/package
    if name_str.startswith('@') and name_str.count('@') == 2:
        parts = name_str.split('@', 2)
        name_str = '@' + parts[1] + '/' + parts[2]
        
    # 2. Normalize other separators (e.g., vue__devtools-api -> vue/devtools-api)
    name_str = name_str.replace('__', '/')
    
    # 3. Remove trailing versions separated by a hyphen (e.g., web3-4.16.0 -> web3)
    name_str = re.sub(r"-\d+\.[\d\.]+$", "", name_str)
    
    # 4. Final safety check: remove any trailing @version suffix
    name_str = re.sub(r"@[\d\.]+$", "", name_str)

    return name_str.strip()

# --- Data Loading and Merging ---

# Load Dynamic Analysis Data
df_dyn = pd.read_csv("dynamic_analysis_results_malicious.csv")
df_dyn['Package_Name'] = df_dyn['Package Name'].apply(clean_dynamic_name)
df_dyn = df_dyn[['Package_Name', 'Malicious Probability', 'Risk Level']].rename(columns={
    'Malicious Probability': 'Dynamic_Prob',
    'Risk Level': 'Dynamic_Risk_Level'
})

# Load Static Analysis Data
df_stat = pd.read_csv("static_batch_analysis_result_malicious.csv")
df_stat['Package_Name'] = df_stat['PACKAGE_NAME'].apply(clean_static_name)
df_stat = df_stat[['Package_Name', 'PROB_MALICIOUS', 'RISK_LEVEL']].rename(columns={
    'PROB_MALICIOUS': 'Static_Prob',
    'RISK_LEVEL': 'Static_Risk_Level'
})

# Perform an outer merge on the cleaned 'Package_Name'
merged_df = pd.merge(
    df_dyn, 
    df_stat, 
    on='Package_Name', 
    how='outer'
)

# Save the merged dataframe
output_filename = "merged_analysis_malicious_smarter.csv"
merged_df.to_csv(output_filename, index=False)
print(f"Malicious analysis data merged 'smarter' and saved to {output_filename}")
