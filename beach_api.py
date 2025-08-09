import requests
from flask import Flask, request, jsonify
from beach_class_model import get_beach_weather
from backend.rip_current import get_rip_info
from find_parking import get_parking_info
from flask_cors import CORS
import numpy as np
import xarray as xr
import geojson
import tempfile
import os
from dotenv import load_dotenv
import earthaccess

app = Flask(__name__)
CORS(app)
load_dotenv()

USERNAME = "bloomsight"
PASSWORD = "Bloomsight123!"

@app.route("/beach-weather")
def beach_weather():
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)

    if lat is None or lon is None:
        return jsonify({"error": "Missing lat or lon"}), 400

    weather_data = get_beach_weather(lat, lon)
    weather_data["rip_risk"] = get_rip_info(lat, lon)
    weather_data["parking_info"] = get_parking_info(lat, lon)

    return jsonify(weather_data)




@app.route("/algae_heatmap.json")
def algae_heatmap():
    try:
        results = earthaccess.search_data(
            short_name='ATL03',
            bounding_box=(-100, 20, -70, 40),   
            temporal=("2023-06-01", "2023-06-03"),
            count=3
        )

        if len(results) == 0:
            return jsonify({"type": "FeatureCollection", "features": []})

        temp_dir = tempfile.mkdtemp(prefix="atl03_")
        files = earthaccess.download(results, temp_dir)

        features = []

        for file_path in files:
            try:
                ds = xr.open_dataset(file_path, engine="h5netcdf")
                
                lat = ds['latitude'].values.flatten()
                lon = ds['longitude'].values.flatten()
                var = ds['delta_time'].values.flatten() if 'delta_time' in ds.variables else None

                for i in range(len(lat)):
                    if not (float(lat[i]) is None or float(lon[i]) is None):
                        properties = {}
                        if var is not None:
                            properties['delta_time'] = float(var[i])
                        features.append(
                            geojson.Feature(
                                geometry=geojson.Point((float(lon[i]), float(lat[i]))),
                                properties=properties
                            )
                        )
                ds.close()
            except Exception as e:
                print(f"Error processing {file_path}: {e}")

        # Cleanup downloaded files
        for file_path in files:
            os.remove(file_path)
        os.rmdir(temp_dir)

        # Return GeoJSON FeatureCollection
        return jsonify(geojson.FeatureCollection(features))

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
