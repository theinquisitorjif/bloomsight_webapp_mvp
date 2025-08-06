# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from supabase_client import init_supabase
import os
TEMP_THRESHOLD = float(os.environ.get("BEACH_TEMP_THRESHOLD", 20.0))
WIND_THRESHOLD = float(os.environ.get("BEACH_WIND_THRESHOLD", 10.0))

supabase = init_supabase()

app = Flask(__name__)
CORS(app)  # allows frontend running on a different port to call the backend

@app.route('/')
def index():
    return "BloomSight API is running!"

# Retrieve all beaches from Supabase
@app.route('/api/beaches', methods=['GET'])
def get_beaches():
    # assumes you have a "beaches" table in Supabase
    response = supabase.table('beaches').select('*').execute()
    return jsonify(response.data), 200

# Weather endpoint used by the map; returns a simple suitability rating
@app.route('/beach-weather', methods=['GET'])
def beach_weather():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    if not lat or not lon:
        return jsonify({'error': 'Missing lat or lon'}), 400

    # call weather API 
    weather_res = requests.get(
        'https://api.open-meteo.com/v1/forecast',
        params={
            'latitude': lat,
            'longitude': lon,
            'hourly': 'temperature_2m,wind_speed_10m',
            'current_weather': True
        }
    )

    if weather_res.status_code != 200:
        return jsonify({'error': 'Failed to fetch weather'}), 500

    data = weather_res.json()
    temp = data['current_weather']['temperature']
    wind = data['current_weather']['windspeed']

    # Classification logic
    if temp >= TEMP_THRESHOLD and wind <= WIND_THRESHOLD:
        overall = 'Suitable for Beach'
        recommendation = 'Great day for the beach!'
    else:
        overall = 'Not Suitable for Beach'
        recommendation = 'Not suitable for beach activities. Consider other plans.'

    return jsonify({'overall': overall, 'recommendation': recommendation})

if __name__ == '__main__':
    # Run on port 5000 to match vite.config.ts proxy
    app.run(host='0.0.0.0', port=5000, debug=True)
