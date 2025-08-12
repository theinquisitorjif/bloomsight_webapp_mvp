import netCDF4
import pandas as pd
import numpy as np
import os

# Configuration
nc_file = 'chl-a-data/AQUA_MODIS.20250808.L3m.DAY.CHL.chlor_a.9km.NRT.nc'
csv_file = 'frontend/public/output_florida.csv'

# Corrected Florida bounding box
FLORIDA_BOUNDS = {
    'lat_min': 24.0,   # Southern (includes Florida Keys)
    'lat_max': 31.5,   # Northern (includes Florida-Georgia border)
    'lon_min': -88.0,  # Western (includes western Panhandle and Gulf waters)
    'lon_max': -79.5   # Eastern (includes eastern coast and Atlantic waters)
}

# 256-color lookup table (index: (R,G,B))
palette_lookup = {
    0: (204, 0, 102), 1: (205, 0, 100), 2: (206, 0, 98), 3: (207, 0, 96), 4: (208, 0, 94),
    5: (209, 0, 92), 6: (210, 0, 90), 7: (211, 0, 88), 8: (212, 0, 86), 9: (213, 0, 84),
    10: (214, 0, 82), 11: (215, 0, 80), 12: (216, 0, 78), 13: (217, 0, 76), 14: (218, 0, 74),
    15: (219, 0, 73), 16: (220, 0, 71), 17: (221, 0, 69), 18: (222, 0, 67), 19: (223, 0, 65),
    20: (224, 0, 63), 21: (225, 0, 61), 22: (226, 0, 59), 23: (227, 0, 57), 24: (228, 0, 55),
    25: (229, 0, 53), 26: (230, 0, 51), 27: (231, 0, 49), 28: (232, 0, 47), 29: (233, 0, 45),
    30: (234, 0, 43), 31: (235, 0, 41), 32: (236, 0, 39), 33: (237, 0, 37), 34: (238, 0, 35),
    35: (239, 0, 33), 36: (240, 0, 31), 37: (241, 0, 29), 38: (242, 0, 27), 39: (243, 0, 25),
    40: (244, 0, 23), 41: (245, 0, 21), 42: (246, 0, 19), 43: (247, 0, 17), 44: (248, 0, 15),
    45: (249, 0, 14), 46: (250, 0, 12), 47: (251, 0, 10), 48: (252, 0, 8), 49: (253, 0, 6),
    50: (254, 0, 4), 51: (255, 0, 2), 52: (255, 0, 0), 53: (255, 3, 0), 54: (255, 6, 0),
    55: (255, 8, 0), 56: (255, 11, 0), 57: (255, 14, 0), 58: (255, 17, 0), 59: (255, 20, 0),
    60: (255, 23, 0), 61: (255, 25, 0), 62: (255, 28, 0), 63: (255, 31, 0), 64: (255, 34, 0),
    65: (255, 37, 0), 66: (255, 40, 0), 67: (255, 42, 0), 68: (255, 45, 0), 69: (255, 48, 0),
    70: (255, 51, 0), 71: (255, 54, 0), 72: (255, 57, 0), 73: (255, 59, 0), 74: (255, 62, 0),
    75: (255, 65, 0), 76: (255, 68, 0), 77: (255, 71, 0), 78: (255, 74, 0), 79: (255, 76, 0),
    80: (255, 79, 0), 81: (255, 82, 0), 82: (255, 85, 0), 83: (255, 88, 0), 84: (255, 91, 0),
    85: (255, 93, 0), 86: (255, 96, 0), 87: (255, 99, 0), 88: (255, 102, 0), 89: (255, 105, 0),
    90: (255, 108, 0), 91: (255, 110, 0), 92: (255, 113, 0), 93: (255, 116, 0), 94: (255, 119, 0),
    95: (255, 122, 0), 96: (255, 125, 0), 97: (255, 127, 0), 98: (255, 130, 0), 99: (255, 133, 0),
    100: (255, 136, 0), 101: (255, 139, 0), 102: (255, 142, 0), 103: (255, 144, 0), 104: (255, 147, 0),
    105: (255, 150, 0), 106: (255, 153, 0), 107: (255, 156, 0), 108: (255, 159, 0), 109: (255, 161, 0),
    110: (255, 164, 0), 111: (255, 167, 0), 112: (255, 170, 0), 113: (255, 173, 0), 114: (255, 176, 0),
    115: (255, 178, 0), 116: (255, 181, 0), 117: (255, 184, 0), 118: (255, 187, 0), 119: (255, 190, 0),
    120: (255, 193, 0), 121: (255, 195, 0), 122: (255, 198, 0), 123: (255, 201, 0), 124: (255, 204, 0),
    125: (255, 207, 0), 126: (255, 210, 0), 127: (255, 212, 0), 128: (255, 215, 0), 129: (255, 218, 0),
    130: (255, 221, 0), 131: (255, 224, 0), 132: (255, 227, 0), 133: (255, 229, 0), 134: (255, 232, 0),
    135: (255, 235, 0), 136: (255, 238, 0), 137: (255, 241, 0), 138: (255, 244, 0), 139: (255, 246, 0),
    140: (255, 249, 0), 141: (255, 252, 0), 142: (255, 255, 0), 143: (252, 255, 0), 144: (249, 255, 0),
    145: (246, 255, 0), 146: (244, 255, 0), 147: (241, 255, 0), 148: (238, 255, 0), 149: (235, 255, 0),
    150: (232, 255, 0), 151: (229, 255, 0), 152: (227, 255, 0), 153: (224, 255, 0), 154: (221, 255, 0),
    155: (218, 255, 0), 156: (215, 255, 0), 157: (212, 255, 0), 158: (210, 255, 0), 159: (207, 255, 0),
    160: (204, 255, 0), 161: (201, 255, 0), 162: (198, 255, 0), 163: (195, 255, 0), 164: (193, 255, 0),
    165: (190, 255, 0), 166: (187, 255, 0), 167: (184, 255, 0), 168: (181, 255, 0), 169: (178, 255, 0),
    170: (176, 255, 0), 171: (173, 255, 0), 172: (170, 255, 0), 173: (167, 255, 0), 174: (164, 255, 0),
    175: (161, 255, 0), 176: (159, 255, 0), 177: (156, 255, 0), 178: (153, 255, 0), 179: (150, 255, 0),
    180: (147, 255, 0), 181: (144, 255, 0), 182: (142, 255, 0), 183: (139, 255, 0), 184: (136, 255, 0),
    185: (133, 255, 0), 186: (130, 255, 0), 187: (127, 255, 0), 188: (125, 255, 0), 189: (122, 255, 0),
    190: (119, 255, 0), 191: (116, 255, 0), 192: (113, 255, 0), 193: (110, 255, 0), 194: (108, 255, 0),
    195: (105, 255, 0), 196: (102, 255, 0), 197: (99, 255, 0), 198: (96, 255, 0), 199: (93, 255, 0),
    200: (91, 255, 0), 201: (88, 255, 0), 202: (85, 255, 0), 203: (82, 255, 0), 204: (79, 255, 0),
    205: (76, 255, 0), 206: (74, 255, 0), 207: (71, 255, 0), 208: (68, 255, 0), 209: (65, 255, 0),
    210: (62, 255, 0), 211: (59, 255, 0), 212: (57, 255, 0), 213: (54, 255, 0), 214: (51, 255, 0),
    215: (48, 255, 0), 216: (45, 255, 0), 217: (42, 255, 0), 218: (40, 255, 0), 219: (37, 255, 0),
    220: (34, 255, 0), 221: (31, 255, 0), 222: (28, 255, 0), 223: (25, 255, 0), 224: (23, 255, 0),
    225: (20, 255, 0), 226: (17, 255, 0), 227: (14, 255, 0), 228: (11, 255, 0), 229: (8, 255, 0),
    230: (6, 255, 0), 231: (3, 255, 0), 232: (0, 255, 0), 233: (0, 255, 3), 234: (0, 255, 6),
    235: (0, 255, 8), 236: (0, 255, 11), 237: (0, 255, 14), 238: (0, 255, 17), 239: (0, 255, 20),
    240: (0, 255, 23), 241: (0, 255, 25), 242: (0, 255, 28), 243: (0, 255, 31), 244: (0, 255, 34),
    245: (0, 255, 37), 246: (0, 255, 40), 247: (0, 255, 42), 248: (0, 255, 45), 249: (0, 255, 48),
    250: (0, 255, 51), 251: (0, 255, 54), 252: (0, 255, 57), 253: (0, 255, 59), 254: (0, 255, 62),
    255: (0, 255, 65)
}

# Function to map chlorophyll-a concentration to palette index
def chlor_to_palette_index(chlor):
    C_min = 0.01  # Minimum chlorophyll-a concentration (mg/m³)
    C_max = 100.0  # Maximum chlorophyll-a concentration (mg/m³)
    try:
        chlor = float(chlor)
        if chlor <= 0 or np.isnan(chlor):
            return np.nan
        # Clip chlorophyll values to valid range
        chlor = max(C_min, min(C_max, chlor))
        # Inverse logarithmic mapping
        log_C = np.log10(chlor)
        index = 255 * (log_C - np.log10(C_min)) / (np.log10(C_max) - np.log10(C_min))
        return int(round(index))
    except (ValueError, TypeError):
        return np.nan

# Function to map palette index to RGB
def map_palette_to_rgb(index):
    if pd.isna(index) or np.isnan(index):
        return (0, 0, 0)
    return palette_lookup.get(int(index), (0, 0, 0))

# Ensure output directory exists
os.makedirs(os.path.dirname(csv_file), exist_ok=True)

try:
    with netCDF4.Dataset(nc_file, mode='r') as ds:
        print('Variables:', ds.variables.keys())
        
        # Extract latitude, longitude, and chlorophyll-a data
        lat = ds.variables['lat'][:]
        lon = ds.variables['lon'][:]
        chlor_a = ds.variables['chlor_a'][:]
        
        # Get fill value from chlor_a variable (default to -32767.0 if not specified)
        fill_value = getattr(ds.variables['chlor_a'], '_FillValue', -32767.0)
        
        # Create meshgrid for coordinates
        lon_grid, lat_grid = np.meshgrid(lon, lat)
        
        # Filter data to Florida bounds and valid chlorophyll-a values
        mask = (lat_grid >= FLORIDA_BOUNDS['lat_min']) & (lat_grid <= FLORIDA_BOUNDS['lat_max']) & \
               (lon_grid >= FLORIDA_BOUNDS['lon_min']) & (lon_grid <= FLORIDA_BOUNDS['lon_max']) & \
               (chlor_a != fill_value) & (~np.ma.is_masked(chlor_a)) & (chlor_a > 0)
        
        # Apply mask to data
        chlor_a = np.where(mask, chlor_a, np.nan)
        lat_grid = np.where(mask, lat_grid, np.nan)
        lon_grid = np.where(mask, lon_grid, np.nan)
        
        # Flatten arrays for DataFrame
        lats = lat_grid.flatten()
        lons = lon_grid.flatten()
        chlor_values = chlor_a.flatten()
        
        # Create DataFrame and filter out invalid data
        df = pd.DataFrame({
            'lat': lats,
            'lon': lons,
            'chlor_a': chlor_values
        })
        df = df.dropna()
        
        if not df.empty:
            print(f"Found {len(df)} valid data points within Florida bounds.")
            
            # Map chlorophyll-a to palette indices
            df['palette'] = df['chlor_a'].apply(chlor_to_palette_index)
            
            # Map palette indices to RGB values
            df[['R', 'G', 'B']] = pd.DataFrame(
                df['palette'].apply(map_palette_to_rgb).tolist(),
                index=df.index
            )
            
            # Flag potential red tide areas (Chl-a >= 10 mg/m³)
            df['red_tide'] = df['chlor_a'].apply(lambda x: 'Yes' if x >= 10 else 'No')
            
            # Save to CSV and verify creation
            df.to_csv(csv_file, index=False)
            if os.path.exists(csv_file):
                print(f"CSV file successfully created at {csv_file} with {len(df)} rows.")
            else:
                print(f"Failed to create CSV file at {csv_file}.")
            
            # Print unique RGB values, chlorophyll-a concentrations, and red tide flags
            print("Unique colours, chlorophyll-a concentrations, and red tide flags in Florida dataset:")
            unique_data = df[['R', 'G', 'B', 'chlor_a', 'red_tide']].drop_duplicates()
            print(unique_data)
        else:
            print('No valid data found within Florida bounds.')
except FileNotFoundError:
    print(f"Error: NetCDF file {nc_file} not found. Please check the file path.")
except Exception as e:
    print(f"Error processing NetCDF file: {str(e)}")