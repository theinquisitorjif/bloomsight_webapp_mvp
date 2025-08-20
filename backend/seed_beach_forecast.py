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

        # <- your 7-day daily list
        try:
            daily = get_beach_forecast(lat, lon)
        except Exception as e:
            print(f"skip {b['id']} ({b.get('name')}): forecast error: {e}")
            continue

        overall, recommendation = classify_from_scores(daily)

        rows.append({
            "beach_id": b["id"],
            "lat": lat,
            "lon": lon,
            "daily": daily,                     
            "overall": overall,                  # optional summary
            "recommendation": recommendation,    # optional summary text
            "updated_at": datetime.utcnow().isoformat()
        })

    if rows:
        # batch insert to avoid large payloads
        CHUNK = 200
        for i in range(0, len(rows), CHUNK):
            upsert(rows[i:i+CHUNK])
        print(f"Upserted {len(rows)} beach forecasts.")
    else:
        print("No beach rows to upsert.")

if __name__ == "__main__":
    run()
