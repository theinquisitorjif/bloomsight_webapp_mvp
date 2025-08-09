import netCDF4
import pandas as pd
import numpy as np

# Configuration
nc_file = 'chl-a-data/AQUA_MODIS.20250808.L3m.DAY.CHL.chlor_a.9km.NRT.nc'
csv_file = 'frontend/public/output.csv'

# Florida bounding box (extended to include surrounding waters)
FLORIDA_BOUNDS = {
    'lat_min': 24.0,   # Southern tip of Florida Keys
    'lat_max': 31.0,   # Northern Florida/Georgia border
    'lon_min': -87.5,  # Western Florida panhandle + Gulf
    'lon_max': -79.0   # Eastern Florida + Atlantic
}

with netCDF4.Dataset(nc_file, mode='r') as ds:
    print('Variables:', ds.variables.keys())
    
    chlor_a = ds.variables['chlor_a'][:]
    lat_var = ds.variables['lat'][:]
    lon_var = ds.variables['lon'][:]
    
    # Find indices for Florida region
    lat_indices = np.where((lat_var >= FLORIDA_BOUNDS['lat_min']) & 
                          (lat_var <= FLORIDA_BOUNDS['lat_max']))[0]
    lon_indices = np.where((lon_var >= FLORIDA_BOUNDS['lon_min']) & 
                          (lon_var <= FLORIDA_BOUNDS['lon_max']))[0]
    
    # Extract Florida region data
    lat_florida = lat_var[lat_indices]
    lon_florida = lon_var[lon_indices]
    
    # Extract the subset of chlorophyll data
    chlor_florida = chlor_a[lat_indices, :][:, lon_indices]
    
    # Create coordinate grid for Florida region
    lon_grid, lat_grid = np.meshgrid(lon_florida, lat_florida)
    
    # Extract valid data points
    lats = []
    lons = []
    values = []
        
    for i in range(chlor_florida.shape[0]):
        for j in range(chlor_florida.shape[1]):
            value = chlor_florida[i, j]
            lat = lat_grid[i, j]
            lon = lon_grid[i, j]
            
            # Skip invalid data
            if np.ma.is_masked(value) or np.isnan(value) or value <= 0:
                continue
            
            # Skip invalid coordinates
            if np.ma.is_masked(lat) or np.ma.is_masked(lon) or np.isnan(lat) or np.isnan(lon):
                continue
            
            # Double-check bounds (in case of floating point issues)
            if (lat < FLORIDA_BOUNDS['lat_min'] or lat > FLORIDA_BOUNDS['lat_max'] or
                lon < FLORIDA_BOUNDS['lon_min'] or lon > FLORIDA_BOUNDS['lon_max']):
                continue
            
            lats.append(float(lat))
            lons.append(float(lon))
            values.append(float(value))
    
    
    # Create DataFrame
    df = pd.DataFrame({
        'chlor_a': values,
        'lat': lats,
        'lon': lons,
        'palette': values
    })
    
    df.to_csv(csv_file, index=False)
