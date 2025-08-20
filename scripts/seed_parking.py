# scripts/seed_parking.py
import os, json, time, requests, math
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()
URL = os.environ["SUPABASE_URL"]
SRK = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ["SUPABASE_ANON_KEY"]
H = {
    "apikey": SRK,
    "Authorization": f"Bearer {SRK}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]

UA = {"User-Agent": "BloomsightSeeder/1.0 (contact: team@bloomsight.example)"}

def beaches(limit=None):
    q = "select=id,name,location"
    if limit: q += f"&limit={int(limit)}"
    r = requests.get(f"{URL}/rest/v1/beaches?{q}", headers=H, timeout=60)
    r.raise_for_status()
    return r.json()

def parse_latlon(s):
    try:
        a, b = s.split(",")
        return float(a.strip()), float(b.strip())
    except Exception:
        return None

def overpass_query(lat, lon, delta=0.05, timeout_s=25):
    south, north = lat - delta, lat + delta
    west,  east  = lon - delta, lon + delta
    return f"""
[out:json][timeout:{timeout_s}];
(
  node["amenity"="parking"]({south},{west},{north},{east});
  way["amenity"="parking"]({south},{west},{north},{east});
  relation["amenity"="parking"]({south},{west},{north},{east});
);
out center 20;
"""

def call_overpass(query, max_retries=5):
    delay = 1.0
    last_err = None
    for i in range(max_retries):
        for base in OVERPASS_URLS:
            try:
                r = requests.get(base, params={"data": query}, headers=UA, timeout=40)
                if r.status_code in (200, 429, 504, 502, 503):
                    if r.status_code == 200:
                        return r.json()
                    # backoff on rate/infra limits
                    last_err = f"{r.status_code} {r.reason}"
                else:
                    r.raise_for_status()
            except Exception as e:
                last_err = str(e)
        time.sleep(delay)
        delay = min(delay * 2, 30)  # exponential backoff
    raise RuntimeError(f"Overpass failed after retries: {last_err}")

def get_parking_info(lat, lon):
    q = overpass_query(lat, lon)
    try:
        data = call_overpass(q)
    except Exception as e:
        # return a minimal payload so we can still upsert a row
        return {
            "latitude": lat,
            "longitude": lon,
            "parking_spots": [],
            "count": 0,
            "error": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    parking_spots = []
    for el in (data.get("elements") or [])[:20]:
        el_lat = el.get("lat") or el.get("center", {}).get("lat")
        el_lon = el.get("lon") or el.get("center", {}).get("lon")
        tags = el.get("tags", {}) or {}
        parking_spots.append({
            "id": el.get("id"),
            "type": el.get("type"),
            "latitude": el_lat,
            "longitude": el_lon,
            "name": tags.get("name"),
            "parking_type": tags.get("parking"),
            "fee": tags.get("fee")
        })

    return {
        "latitude": lat,
        "longitude": lon,
        "parking_spots": parking_spots,
        "count": len(parking_spots),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

def upsert(rows):
    r = requests.post(
        f"{URL}/rest/v1/parking?on_conflict=beach_id",
        headers={**H, "Prefer":"resolution=merge-duplicates,return=representation"},
        data=json.dumps(rows),
        timeout=120
    )
    if r.status_code >= 400:
        raise RuntimeError(r.text)

def run():
    rows = []
    for b in beaches():  # add limit=20 while testing
        ll = parse_latlon(b.get("location",""))
        if not ll:
            continue
        lat, lon = ll

        info = get_parking_info(lat, lon)

        rows.append({
            "beach_id": b["id"],
            "lat": lat,
            "lon": lon,
            "results": info,                 # jsonb
            "count": info.get("count", 0),
            "source_id": "overpass",         # <-- satisfies NOT NULL if present
            "updated_at": datetime.now(timezone.utc).isoformat()
        })

        # polite: 1 request/second to Overpass
        time.sleep(1.0)

        if len(rows) >= 40:
            upsert(rows); rows.clear()

    if rows:
        upsert(rows)

    print("Parking seed complete.")

if __name__ == "__main__":
    run()
