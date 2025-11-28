Perform Analysis
1. Download and extract package(s) to scan into a single folder.
2. Execute batch_analysis_final.py using:
"python3 batch_analysis_final.py <path to extracted packages>"
3. batch_analysis_result.csv will be stored in the "Analysis" folder in the same directory as the extracted packages.
4. Read batch_analysis_result.csv to view the risk tier of each package scanned.

Perform Security Analysis of Package.
1. Run analyse_contributing_feature.py with the analysis directory as argument to generate contributing_features.csv in the analysis directory.
"python3 analyse_contributing_feature.py --analysis-dir <Analysis directory> --top-k <no. of features?"
Note: If file to analyse is not in default directory that its generated, explicit paths of results csv, feature csv, model directory, and output path can be specified.
2. For package of interest, the top features contributing to the score can be read from the contributing_features.csv.
3. Deeper analysis of the package can be performed using the following files:
- <Analysis dir>/Consolidated_Package_Scores.tsv contains the package level count of each raw feature, for all packages.
- <Analysis dir>/<package name>/consolidated_scores.tsv contains the count of each raw feature, at the package level, and individual file level.
- <Analysis dir>/<package name>/<Details> contain a .txt file for each category of raw feature and each file in the package. Each file name is generated using <Raw feature category>_detail_<path to file from extraction directory with "/" replaced by "--">_<name of analyzed file>.txt




