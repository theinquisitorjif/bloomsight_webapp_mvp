from flask import Flask, request, jsonify
from beach_class_model import get_beach_weather
from flask_cors import CORS


app = Flask(__name__)
CORS(app) 

@app.route("/beach-weather")
def beach_weather():
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)

    if lat is None or lon is None:
        return jsonify({"error": "Missing lat or lon"}), 400
    
    data = get_beach_weather(lat, lon)
    return jsonify(data)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
