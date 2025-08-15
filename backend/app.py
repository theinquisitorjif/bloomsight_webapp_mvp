import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from supabase_client import init_supabase
from rip_current import NOAAMarineData
from beach_access_points import main as get_beach_access_json
from tide_conditions import get_tide_prediction_json
from daily_beach_forecast_backend import get_beach_forecast
from fwc_redtide import beaches as redtide_beaches

TEMP_THRESHOLD = float(os.environ.get("BEACH_TEMP_THRESHOLD", 20.0))
WIND_THRESHOLD = float(os.environ.get("BEACH_WIND_THRESHOLD", 10.0))

supabase = init_supabase()
noaa = NOAAMarineData()

app = Flask(__name__)
CORS(app, supports_credentials=True, origins="http://localhost:5173")  # allows frontend running on a different port to call the backend


@app.route('/')
def index():
    return "BloomSight API is running!"


# Retrieve all beaches from Supabase
@app.route('/beaches', methods=['GET'])
def get_beaches():
    response = supabase.table('beaches').select('*').execute()
    return jsonify(response.data), 200


# Manually add a beach to Supabase
@app.route('/beaches', methods=['POST'])
def add_beach():
    data = request.json
    result = supabase.table("beaches").insert(data).execute()
    return jsonify(result.data), 201


# Update a beach in Supabase
@app.route('/beaches/<int:id>', methods=['PUT'])
def update_beach(id):
    data = request.json
    result = supabase.table("beaches").update(data).eq('id', id).execute()
    return jsonify(result.data), 200


# Delete a beach from Supabase
@app.route('/beaches/<int:id>', methods=['DELETE'])
def delete_beach(id):
    result = supabase.table("beaches").delete().eq('id', id).execute()
    return jsonify({"message": "Deleted"}), 204

# Beach Conditions Endpoint
@app.route('/beaches/<int:beach_id>/riptide-risk', methods=['GET'])
def beach_conditions(beach_id):
    # Retrieve the beach info from Supabase
    beach_data = supabase.table('beaches').select('*').eq('id', beach_id).single().execute()

    if not beach_data.data:
        return jsonify({'error': 'Beach not found'}), 404
    
    beach = beach_data.data
    location = beach.get('location')
    lat_str, lon_str = location.split(",")
    lat = float(lat_str.strip())
    lon = float(lon_str.strip())
    
    force = request.args.get('force', default='0')

    if lat is None or lon is None:
        return jsonify({'error': 'Missing lat or lon'}), 400

    try:
        result = noaa.get_rip_current_risk(lat, lon, force_refresh=(force == '1'))
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Endpoint to get top beach parking/access points
@app.route('/beaches/<int:beach_id>/parking-spots', methods=['GET'])
def beach_parking(beach_id):
    # Retrieve the beach info from Supabase
    beach_data = supabase.table('beaches').select('*').eq('id', beach_id).single().execute()

    if not beach_data.data:
        return jsonify({'error': 'Beach not found'}), 404

    beach = beach_data.data
    beach_name = beach.get('name')

    try:
        # Call the function from beach_access_points.py
        data = get_beach_access_json(beach_name)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#Endpoint for getting tide predictions
@app.route("/beaches/<int:beach_id>/tide-prediction", methods=["GET"])
def tide_prediction(beach_id):
    # Retrieve the beach info from Supabase
    beach_data = supabase.table('beaches').select('*').eq('id', beach_id).single().execute()

    if not beach_data.data:
        return jsonify({'error': 'Beach not found'}), 404

    beach = beach_data.data
    location = beach.get('location')
    name = beach.get('name')
    lat_str, lon_str = location.split(",")
    lat = float(lat_str.strip())
    lon = float(lon_str.strip())

    if lat is None or lon is None:
        return jsonify({'error': 'Beach coordinates missing'}), 400

    data = get_tide_prediction_json(lat, lon, name)
    return jsonify(data), 200

#For getting weather forecast data
@app.route('/beaches/<int:beach_id>/weather-forecast', methods=['GET'])
def beach_weather_forecast(beach_id):
    # Retrieve the beach info from Supabase
    beach_data = supabase.table('beaches').select('*').eq('id', beach_id).single().execute()

    if not beach_data.data:
        return jsonify({'error': 'Beach not found'}), 404

    beach = beach_data.data
    location = beach.get('location')
    lat_str, lon_str = location.split(",")
    lat = float(lat_str.strip())
    lon = float(lon_str.strip())

    if lat is None or lon is None:
        return jsonify({'error': 'Beach coordinates missing'}), 400

    try:
        forecasts = get_beach_forecast(lat, lon)
        return jsonify(forecasts), 200
    except Exception as e:
        return jsonify({'error': f'Failed to fetch forecast: {str(e)}'}), 500

#get water quality/ red tide/ karena brevis abundance
@app.route('/beaches/<int:beach_id>/water-quality', methods=['GET'])
def beach_water_quality(beach_id):
    # Retrieve the beach info from Supabase
    beach_data = supabase.table('beaches').select('*').eq('id', beach_id).single().execute()

    if not beach_data.data:
        return jsonify({'error': 'Beach not found'}), 404

    beach = beach_data.data
    location = beach.get('location')
    lat_str, lon_str = location.split(",")
    lat = float(lat_str.strip())
    lon = float(lon_str.strip())
    name = beach.get('name')

    # Find the FWC red tide data from the local beaches list
    fwc_beach = next((b for b in redtide_beaches if b["name"] == name), None)
    if not fwc_beach:
        return jsonify({'error': 'No water quality data for this beach'}), 404

    # Map abundance to numeric risk score
    abundance = fwc_beach.get("abundance", "not present").lower()
    if abundance == "high":
        risk_score = 5
    elif abundance == "medium":
        risk_score = 3
    elif abundance == "low":
        risk_score = 1
    else:
        risk_score = 0  # not present / safe

    # Construct JSON response
    water_quality = {
        "karena_brevis_risk": risk_score,
        "abundance": fwc_beach.get("abundance", "not present"),
        "latitude": lat,
        "longitude": lon
    }

    return jsonify(water_quality), 200

if __name__ == '__main__':
    # Run on port 5000 to match vite.config.ts proxy
    app.run(host='0.0.0.0', port=5002, debug=True, use_reloader=False)
