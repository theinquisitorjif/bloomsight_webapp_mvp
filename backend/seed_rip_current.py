import os, json, time, requests
from datetime import datetime, timezone
from dotenv import load_dotenv
# choose one of your helpers:
# from rip_current import NOAAMarineData
from rip_current import NOAAMarineData  # your class with get_rip_current_risk

load_dotenv()
URL = os.environ["SUPABASE_URL"]
SRK = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ["SUPABASE_ANON_KEY"]
H = {
    "apikey": SRK,
    "Authorization": f"Bearer {SRK}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def beaches():
    r = requests.get(f"{URL}/rest/v1/beaches?select=id,name,location", headers=H, timeout=60)
    r.raise_for_status()
    return r.json()

def parse_latlon(s):
    try:
        a,b = s.split(",")
        return float(a.strip()), float(b.strip())
    except Exception:
        return None

def upsert(rows):
    r = requests.post(
        f"{URL}/rest/v1/rip_current_data?on_conflict=beach_id",
        headers={**H, "Prefer":"resolution=merge-duplicates,return=representation"},
        data=json.dumps(rows),
        timeout=120
    )
    if r.status_code >= 400:
        raise RuntimeError(r.text)

def run():
    noaa = NOAAMarineData()
    rows = []

    for b in beaches():
        ll = parse_latlon(b.get("location",""))
        if not ll:
            continue
        lat, lon = ll

        try:
            # cached by your class; returns dict (risk_level, alerts, conditions, etc.)
            payload = noaa.get_rip_current_risk(lat, lon, force_refresh=False)
            risk_level = payload.get("risk_level", "unknown")
        except Exception as e:
            payload = {"error": str(e)}
            risk_level = "error"

        rows.append({
            "beach_id": b["id"],
            "lat": lat,
            "lon": lon,
            "risk_level": risk_level,
            "payload": payload,
            "updated_at": datetime.now(timezone.utc).isoformat()
        })

        time.sleep(0.3)  # be nice to NOAA

        if len(rows) >= 50:
            upsert(rows); rows.clear()

    if rows:
        upsert(rows)
    print("Rip-current seed complete.")

if __name__ == "__main__":
    run()
