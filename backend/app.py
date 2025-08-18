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
from datetime import datetime
import uuid
import jwt

TEMP_THRESHOLD = float(os.environ.get("BEACH_TEMP_THRESHOLD", 20.0))
WIND_THRESHOLD = float(os.environ.get("BEACH_WIND_THRESHOLD", 10.0))

supabase = init_supabase()
noaa = NOAAMarineData()

JWT_ALGORITHM = "HS256"
JWT_SECRET = "dwKQfXYKBxqdf5uU9hTDkvNtjpNEspAWjKB0tjzy571O/KI4+Nppz3V3l+uZ9PN+Am2lonfCFGDUPDsU7ugR4Q=="

app = Flask(__name__)
CORS(app, supports_credentials=True, origins="http://localhost:5173")  # allows frontend running on a different port to call the backen

@app.route('/')
def index():
    return "BloomSight API is running!"

def get_current_user():
    auth_header = request.headers.get("Authorization", None)
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ")[1]

    print("Got token auth header:", token)

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload  # contains "sub" (user_id), "email", etc.
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

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
    result = supabase.table("beaches").update(data).eq('mapbox_id', id).execute()
    return jsonify(result.data), 200


# Delete a beach from Supabase
@app.route('/beaches/<int:id>', methods=['DELETE'])
def delete_beach(id):
    result = supabase.table("beaches").delete().eq('mapbox_id', id).execute()
    return jsonify({"message": "Deleted"}), 204

# Beach Conditions Endpoint
@app.route('/beaches/<int:beach_id>/riptide-risk', methods=['GET'])
def beach_conditions(beach_id):
    # Retrieve the beach info from Supabase
    beach_data = supabase.table('beaches').select('*').eq('mapbox_id', beach_id).single().execute()

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
    beach_data = supabase.table('beaches').select('*').eq('mapbox_id', beach_id).single().execute()

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
    beach_data = supabase.table('beaches').select('*').eq('mapbox_id', beach_id).single().execute()

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
    beach_data = supabase.table('beaches').select('*').eq('mapbox_id', beach_id).single().execute()

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
    beach_data = supabase.table('beaches').select('*').eq('mapbox_id', beach_id).single().execute()

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

@app.route("/beaches/<int:beach_id>/pictures", methods=["POST"])
def add_picture(beach_id):
    user = get_current_user()
    if not user:
        return jsonify({"error": "Not authenticated"}), 401
    user_id = user["id"]
    file = request.files.get("file")
    comment_id = int(comment_id) if comment_id else None

    if not file:
        return jsonify({"error": "No file provided"}), 400
    
    if not comment_id:
        return jsonify({"error": "No comment ID provided"}), 400

    # Create unique filename
    file_ext = file.filename.split(".")[-1]
    file_name = f"{uuid.uuid4()}.{file_ext}"

    # Upload to Supabase storage bucket "pictures"
    supabase.storage.from_("pictures").upload(file_name, file.read())

    # Get public URL
    public_url = supabase.storage.from_("pictures").get_public_url(file_name)

    # Insert into pictures table
    supabase.table("pictures").insert({
        "beach_id": beach_id,
        "comment_id": comment_id,
        "user_id": user_id,
        "image_url": public_url,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }).execute()

    return jsonify({"image_url": public_url})

@app.route("/beaches/<int:beach_id>/comments", methods=["GET"])
def get_comments(beach_id):
    page = int(request.args.get("page", 1))
    page_size = 6
    offset = (page - 1) * page_size

    res = supabase.table("comments").select("*").eq("beach_id", beach_id).order("timestamp", desc=True).range(offset, offset + page_size - 1).execute()

    return jsonify({
        "page": page,
        "page_size": page_size,
        "comments": res.data
    })

@app.route("/beaches/<int:beach_id>/reviews", methods=["GET"])
def get_reviews(beach_id):    
    comments = supabase.table("comments").select("rating").eq("beach_id", beach_id).execute()
    
    ratings = [comment["rating"] for comment in comments.data]

    if not ratings:
        return jsonify({
            "overall_rating": 0,
            "number_of_reviews": 0,
            "number_of_reviews_per_rating": {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0
            }
        })
    
    total_reviews = len(ratings)
    overall_rating = round(sum(ratings) / total_reviews, 2)

    breakdown = {i: ratings.count(i) for i in range(1, 6)}

    return jsonify({
        "overall_rating": overall_rating,
        "number_of_reviews": total_reviews,
        "number_of_reviews_per_rating": breakdown
    })

@app.route("/beaches/<int:beach_id>/comments", methods=["POST"])
def add_comment(beach_id):
    user = get_current_user()
    if not user:
        return jsonify({"error": "Not authenticated"}), 401
    user_id = user["id"]

    if not user_id:
        return jsonify({"error": "Not authenticated. User ID not found."}), 401

    data = request.json
    content = data.get("content")
    rating = data.get("rating")
    conditions = data.get("conditions") # Just a string seperated by commas
    reports = data.get("reports") # Array of report IDs (i.e. 4, 5, 6...)
    timestamp = data.get("timestamp")

    if (rating < 1) or (rating > 5):
        return jsonify({"error": "Rating must be between 1 and 5"}), 400
    
    if (not rating) or (not timestamp):
        return jsonify({"error": "Missing required fields: rating, timestamp"}), 400

    res = supabase.table("comments").insert({
        "user_id": user_id,
        "beach_id": beach_id,
        "content": content,
        "rating": rating,
        "conditions": conditions,
        "likes": 0,
        "timestamp": timestamp
    }).execute()

    # Insert reports if they exist
    if reports:
        for report_id in reports:
            supabase.table("comments_conditions").insert({
                "comment_id": res.data[0]["id"],
                "condition_id": report_id,
                "beach_id": beach_id
            }).execute()

    return jsonify(res.data[0]) if res.data else (jsonify({"error": "Insert failed"}), 400)

@app.route("/beaches/<int:beach_id>/comments/<int:comment_id>", methods=["DELETE"])
def delete_comment(beach_id, comment_id):
    user = get_current_user()
    if not user:
        return jsonify({"error": "Not authenticated"}), 401
    user_id = user["id"]
    
    isUsersComment = supabase.table("comments").select("*").eq("id", comment_id).eq("user_id", user_id).execute()
    
    if not isUsersComment.data:
        return jsonify({"error": "Not authorized"}), 401

    res = supabase.table("comments").delete().eq("id", comment_id).eq("beach_id", beach_id).execute()
    return jsonify({"deleted": True}) if res.data else (jsonify({"error": "Not found"}), 404)

@app.route("/beaches/<int:beach_id>/reports", methods=["GET"])
def get_reports(beach_id):
    # Fetch all reports for this beach
    reports_res = supabase.table("comments_conditions").select("*").eq("beach_id", beach_id).execute()

    current_time = datetime.utcnow()
    valid_reports = []

    for report in reports_res.data:
        # Fetch user info
        user_res = supabase.table("users").select("id, picture").eq("id", report["user_id"]).execute()
        if user_res.data:
            report["user"] = user_res.data[0]

        # Fetch condition (for threshold)
        condition_res = supabase.table("conditions").select("threshold").eq("id", report["condition_id"]).execute()
        if not condition_res.data:
            continue
        threshold = condition_res.data[0]["threshold"]

        # Fetch comment timestamp
        comment_res = supabase.table("comments").select("timestamp").eq("id", report["comment_id"]).execute()
        if not comment_res.data:
            continue

        ts = comment_res.data[0]["timestamp"].replace("Z", "")
        comment_timestamp = datetime.fromisoformat(ts)

        # Keep report only if within threshold
        if (comment_timestamp + datetime.timedelta(hours=threshold)) >= current_time:
            valid_reports.append(report)
        # else:
        #     # Clean up expired reports in DB
        #     supabase.table("comments_conditions").delete().eq("id", report["id"]).execute()

    return jsonify(valid_reports)

@app.route("/beaches/reports", methods=["GET"])
def get_beach_reports():
    res = supabase.table("conditions").select("*").eq("type", 1).execute()
    return jsonify(res.data)
 
@app.route("/beaches/<int:beach_id>/pictures", methods=["GET"])
def get_beach_pictures(beach_id):
    res = supabase.table("pictures").select("*").eq("beach_id", beach_id).order("timestamp", desc=True).execute()
    return jsonify(res.data)

if __name__ == '__main__':
    # Run on port 5000 to match vite.config.ts proxy
    app.run(host='0.0.0.0', port=5002, debug=True, use_reloader=False)
