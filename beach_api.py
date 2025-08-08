from flask import Flask, request, jsonify
from beach_class_model import get_beach_weather
from rip_current import get_rip_info
from find_parking import get_parking_info
from flask_cors import CORS
import earthaccess
import numpy as np
import xarray as xr
from datetime import datetime, timedelta
import requests
from scipy.spatial import cKDTree

app = Flask(__name__)
CORS(app) 

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

EARTHDATA_USERNAME = "bloomsight"
EARTHDATA_PASSWORD = "Bloomsight123!"

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
