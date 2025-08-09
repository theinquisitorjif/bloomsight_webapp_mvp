import os, json, requests
from datetime import datetime
from beach_forecast import fetch_open_meteo
from beach_class_model import BeachClassModel
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY")
HEADERS = {"apikey": KEY, "Authorization": f"Bearer {KEY}", "Content-Type": "application/json", "Prefer": "return=representation"}

def beaches():
    r = requests.get(f"{SUPABASE_URL}/rest/v1/beaches?select=id,name,location", headers=HEADERS, timeout=60)
    r.raise_for_status(); return r.json()

def upsert(rows):
    r = requests.post(f"{SUPABASE_URL}/rest/v1/beach_forecasts?on_conflict=beach_id",
                      headers={**HEADERS, "Prefer":"resolution=merge-duplicates,return=representation"},
                      data=json.dumps(rows), timeout=120)
    if r.status_code >= 400: raise RuntimeError(r.text)

def parse_loc(s):
    try: a,b = s.split(","); return float(a), float(b)
    except: return None

def run():
    rows=[]
    for b in beaches():
        ll = parse_loc(b.get("location",""))
        if not ll: continue
        lat, lon = ll
        fx = fetch_open_meteo(lat, lon)
        cur = fx["current"]
        model = BeachClassModel(
            temperature=cur["temperature_2m"],
            precipitation=cur["precipitation"],
            rain=cur["rain"],
            wind_speed=cur["wind_speed_10m"]*3.6,
            wind_gusts=cur["wind_gusts_10m"]*3.6,
            is_day=cur["is_day"],
            cloud_cover=cur["cloud_cover"],
            weather_code=cur["weathercode"],
            humidity=cur["relative_humidity_2m"],
            uv_index=cur["uv_index"],
        )
        rows.append({
            "beach_id": b["id"],
            "lat": lat, "lon": lon,
            "overall": model.classify_beach_overall(),
            "recommendation": model.overall_recommendation(),
            "current": cur,
            "hourly": fx["hourly"],
            "updated_at": datetime.utcnow().isoformat()
        })
    upsert(rows)
    print(f"Upserted {len(rows)} beach forecasts.")

if __name__ == "__main__":
    run()
