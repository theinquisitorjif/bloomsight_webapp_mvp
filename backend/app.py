import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import datetime
from supabase_client import init_supabase
from rip_current import NOAAMarineData
from rip_current import get_rip_risk_json 
from apscheduler.schedulers.background import BackgroundScheduler
import time

STALE_AFTER_MIN = int(os.getenv("RISK_TTL_MIN", "20"))
TEMP_THRESHOLD = float(os.environ.get("BEACH_TEMP_THRESHOLD", 20.0))
WIND_THRESHOLD = float(os.environ.get("BEACH_WIND_THRESHOLD", 10.0))

supabase = init_supabase()
noaa = NOAAMarineData()

app = Flask(__name__)
CORS(app)  # allows frontend running on a different port to call the backend

def _refresh_risk_async(beach_id: int, lat: float, lon: float):
    try:
        data = get_rip_risk_json(lat, lon)
        supabase.table("rip_current_data").upsert({
            "beach_id": beach_id,
            "lat": lat,
            "lon": lon,
            "risk_level": data.get("risk_level"),
            "score": data.get("score"),
            "recommendation": data.get("recommendation"),
            "data": data,
            "updated_at": datetime.utcnow().isoformat()
        }, on_conflict=["beach_id"]).execute()
    except Exception as e:
        print("async refresh error:", e)
        
def refresh_all_rip_risk():
    try:
        beaches = supabase.table("beaches").select("id,name,location").execute().data
        for b in beaches:
            loc = b.get("location", "")
            try:
                lat, lon = [float(x.strip()) for x in loc.split(",")]
            except Exception:
                continue
            # refresh each beach (respect rate limits)
            _refresh_risk_async(b["id"], lat, lon)
            time.sleep(1.0)  # be polite to upstream APIs
        print("[scheduler] rip risk refresh enqueued for", len(beaches), "beaches")
    except Exception as e:
        print("scheduler error:", e)

def start_scheduler():
    sched = BackgroundScheduler(daemon=True)
    # every 15 minutes
    sched.add_job(refresh_all_rip_risk, "interval", minutes=15, id="rip_refresh")
    # you could also add a nightly parking refresh job here
    sched.start()

@app.route('/')
def index():
    return "BloomSight API is running!"

# Retrieve all beaches from Supabase
@app.route('/api/beaches', methods=['GET'])
def get_beaches():
    response = supabase.table('beaches').select('*').execute()
    return jsonify(response.data), 200

# Manually add a beach to Supabase
@app.route('/api/beaches', methods=['POST'])
def add_beach():
    data = request.json
    result = supabase.table("beaches").insert(data).execute()
    return jsonify(result.data), 201

# Update a beach in Supabase
@app.route('/api/beaches/<int:id>', methods=['PUT'])
def update_beach(id):
    data = request.json
    result = supabase.table("beaches").update(data).eq('id', id).execute()
    return jsonify(result.data), 200

# Delete a beach from Supabase
@app.route('/api/beaches/<int:id>', methods=['DELETE'])
def delete_beach(id):
    result = supabase.table("beaches").delete().eq('id', id).execute()
    return jsonify({"message": "Deleted"}), 204

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

# Beach Conditions Endpoint
@app.route('/api/beach-conditions', methods=['GET'])
def beach_conditions():
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)
    beach_id = request.args.get('beach_id', type=int)  # let frontend pass beach_id
    if lat is None or lon is None or beach_id is None:
        return jsonify({'error': 'Missing beach_id, lat, or lon'}), 400

    # read from DB first
    resp = supabase.table('rip_current_data')\
        .select('*').eq('beach_id', beach_id).limit(1).execute()
    row = (resp.data or [None])[0]

    stale = True
    if row and row.get("updated_at"):
        ts = datetime.fromisoformat(row["updated_at"].replace('Z',''))
        stale = (datetime.utcnow() - ts) > timedelta(minutes=STALE_AFTER_MIN)

    # fire-and-forget refresh if stale
    if stale:
        Thread(target=_refresh_risk_async, args=(beach_id, lat, lon), daemon=True).start()

    # return cached (or empty shell)
    if row:
        return jsonify({
            "cached": True,
            "stale": stale,
            "risk_level": row["risk_level"],
            "score": row["score"],
            "recommendation": row["recommendation"],
            "data": row["data"],
            "last_updated": row["updated_at"]
        }), 200
    else:
        # first time: compute once (slow path), save, return
        data = get_rip_risk_json(lat, lon)
        supabase.table("rip_current_data").upsert({
            "beach_id": beach_id,
            "lat": lat, "lon": lon,
            "risk_level": data.get("risk_level"),
            "score": data.get("score"),
            "recommendation": data.get("recommendation"),
            "data": data,
            "updated_at": datetime.utcnow().isoformat()
        }, on_conflict=["beach_id"]).execute()
        return jsonify({"cached": False, "stale": False, **data}), 200

# Beach Forecast Endpoint 
@app.route("/api/beach-forecast", methods=["GET"])
def beach_forecast():
    beach_id = request.args.get("beach_id", type=int)
    if not beach_id:
        return jsonify({"error":"missing beach_id"}), 400
    row = supabase.table("beach_forecasts").select("*").eq("beach_id", beach_id).single().execute().data
    if not row: return jsonify({"error":"not found"}), 404
    return jsonify(row), 200

if __name__ == '__main__':
    # Run on port 5000 to match vite.config.ts proxy
    start_scheduler()
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)

