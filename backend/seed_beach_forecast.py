import os, json, requests
from datetime import datetime
from dotenv import load_dotenv
from daily_beach_forecast_backend import get_beach_forecast 

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SERVICE = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ["SUPABASE_ANON_KEY"]
HEADERS = {
    "apikey": SERVICE,
    "Authorization": f"Bearer {SERVICE}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def fetch_beaches():
    r = requests.get(f"{SUPABASE_URL}/rest/v1/beaches?select=id,name,location", headers=HEADERS, timeout=60)
    r.raise_for_status()
    return r.json()

def parse_latlon(s: str):
    try:
        a, b = s.split(",")
        return float(a.strip()), float(b.strip())
    except Exception:
        return None
    
def fetch_current_and_hourly(lat: float, lon: float):
    wx_params = {
        "latitude": lat,
        "longitude": lon,
        "timezone": "auto",
        "current": [
            "temperature_2m", "precipitation", "rain",
            "wind_speed_10m", "wind_gusts_10m",
            "relative_humidity_2m", "uv_index", "cloud_cover", "weather_code"
        ],
        "hourly": [
            "temperature_2m", "precipitation_probability", "rain",
            "wind_speed_10m", "relative_humidity_2m",
            "uv_index", "cloud_cover"
        ],
    }

    wx = requests.get("https://api.open-meteo.com/v1/forecast",
                      params=wx_params, timeout=20).json()

    current = wx.get("current") or {}
    hourly = wx.get("hourly") or {}

    # Optional: add latest US AQI to "current"
    try:
        aq_params = {
            "latitude": lat, "longitude": lon,
            "timezone": "auto",
            "hourly": ["us_aqi"]
        }
        aq = requests.get("https://air-quality-api.open-meteo.com/v1/air-quality",
                          params=aq_params, timeout=20).json()
        aqi_series = (aq.get("hourly") or {}).get("us_aqi")
        if isinstance(aqi_series, list) and aqi_series:
            current["air_quality"] = aqi_series[-1]
    except Exception:
        # don’t fail seeding if AQI fetch fails
        pass

    return current, hourly

def classify_from_scores(days):
    # map the 7-day average score (0–5) to a simple label
    scores = [d.get("recommendation_score") for d in days if d.get("recommendation_score") is not None]
    if not scores: return ("unknown", "No data")
    avg = sum(scores) / len(scores)
    if avg >= 4:  return ("great", "Great beach conditions this week")
    if avg >= 3:  return ("good",  "Generally good; check daily details")
    if avg >= 2:  return ("fair",  "Mixed; monitor wind/precip")
    return ("poor", "Unfavorable most days")

def upsert(rows):
    url = f"{SUPABASE_URL}/rest/v1/beach_forecasts?on_conflict=beach_id"
    r = requests.post(
        url,
        headers={**HEADERS, "Prefer": "resolution=merge-duplicates,return=representation"},
        data=json.dumps(rows),
        timeout=120
    )
    if r.status_code >= 400:
        raise RuntimeError(r.text)

def run():
    rows = []
    for b in fetch_beaches():
        ll = parse_latlon(b.get("location", ""))
        if not ll:
            continue
        lat, lon = ll

        # 1) daily (your existing function)
        try:
            daily = get_beach_forecast(lat, lon)  # returns a 7-day list you already use
        except Exception as e:
            print(f"skip {b['id']} ({b.get('name')}): forecast error: {e}")
            continue

        # 2) current + hourly (NEW)
        try:
            current, hourly = fetch_current_and_hourly(lat, lon)
        except Exception as e:
            print(f"warning: current/hourly fetch failed for {b['id']} ({b.get('name')}): {e}")
            current, hourly = {}, {}

        overall, recommendation = classify_from_scores(daily)

        rows.append({
            "beach_id": b["id"],      # must match your table schema
            "lat": lat,
            "lon": lon,
            "current": current,       # <-- NEW: JSONB
            "hourly": hourly,         # <-- NEW: JSONB
            "daily": daily,           # existing
            "overall": overall,
            "recommendation": recommendation,
            "updated_at": datetime.utcnow().isoformat()
        })

    if rows:
        CHUNK = 200
        for i in range(0, len(rows), CHUNK):
            upsert(rows[i:i+CHUNK])
        print(f"Upserted {len(rows)} beach forecasts.")
    else:
        print("No beach rows to upsert.")

if __name__ == "__main__":
    run()
