from flask import Flask, jsonify
from beach_class_model import get_beach_weather

app = Flask(__name__)

@app.route("/beach-weather")
def beach_weather():
    data = get_beach_weather()
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)
