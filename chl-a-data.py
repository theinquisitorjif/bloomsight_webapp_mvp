
import netCDF4
import pandas as pd
import numpy as np
import os

# Path to your .nc file
nc_file = 'chl-a-data\AQUA_MODIS.20250808.L3m.DAY.CHL.chlor_a.9km.NRT.nc'
csv_file = 'output.csv'   

# Open the NetCDF file
with netCDF4.Dataset(nc_file, mode='r') as ds:
	# List all variables
	print('Variables:', ds.variables.keys())
	# Example: extract all variables into a DataFrame
	data = {}
	for var in ds.variables:
		arr = ds.variables[var][:]
		# Flatten arrays if needed
		if arr.ndim > 1:
			arr = arr.flatten()
		data[var] = arr
	# Find the minimum length among variables
	min_len = min(len(v) for v in data.values())
	# Truncate all arrays to the same length
	for k in data:
		data[k] = data[k][:min_len]

	# Create DataFrame keep out all data that is nan palette
	df = pd.DataFrame(data)
	df = df[df['palette'].notna()]
	# Save to CSV
	df.to_csv(csv_file, index=False)
	print(f'CSV file saved to {csv_file}')



#Extract only palette values that dont have a value of 0 and nan
palette_values = df['palette'].values
#Print them
print(palette_values[palette_values != 0])
