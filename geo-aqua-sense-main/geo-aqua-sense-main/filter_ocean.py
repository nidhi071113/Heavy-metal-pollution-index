import pandas as pd
from global_land_mask import globe

# Paths
input_csv = r"d:\geo-aqua-sense-main\geo-aqua-sense-main\global_groundwater_hmpi_dataset_2500.csv"
output_csv = r"d:\geo-aqua-sense-main\geo-aqua-sense-main\public\data\global_data.csv"

print("Loading dataset...")
df = pd.read_csv(input_csv)
initial_count = len(df)

print("Filtering ocean coordinates...")
# globe.is_land takes lat, lon arrays
is_on_land = globe.is_land(df['latitude'].values, df['longitude'].values)

df_land = df[is_on_land]
final_count = len(df_land)
removed_count = initial_count - final_count

print(f"Initial rows: {initial_count}")
print(f"Removed ocean rows: {removed_count}")
print(f"Remaining land rows: {final_count}")

print("Saving filtered datasets...")
df_land.to_csv(output_csv, index=False)
df_land.to_csv(input_csv, index=False)

print("Updated both datasets successfully.")
