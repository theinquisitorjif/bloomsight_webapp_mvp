# seed_beaches.py
import os, json
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
url = os.environ["SUPABASE_URL"]
key = os.environ["SUPABASE_ANON_KEY"]  
sb = create_client(url, key)

GEOJSON_PATH = r"C:\Users\asher\bloomsight_webapp_mvp\backend\allBeaches.geojson"  

def lonlat_from_feature(f):
    g = f.get("geometry", {})
    t = g.get("type")
    c = g.get("coordinates")
    if t == "Point" and isinstance(c, list) and len(c) == 2:
        lon, lat = c
        return lat, lon
    # fallback: center of first ring for Polygon/MultiPolygon
    try:
        if t == "Polygon": pts = c[0]
        elif t == "MultiPolygon": pts = c[0][0]
        else: return None
        xs, ys = zip(*pts)
        return (sum(ys)/len(ys), sum(xs)/len(xs))
    except Exception:
        return None

def main():
    with open(GEOJSON_PATH, "r", encoding="utf-8") as f:
        gj = json.load(f)

    rows = []
    for feat in gj.get("features", []):
        props = feat.get("properties", {})
        raw_id = props.get("@id")
        name = props.get("name")
        if not raw_id or not name: 
            continue

        # keep numeric-only (or use raw_id.replace("/", "-") if you want type)
        mapbox_id = raw_id.split("/", 1)[-1]

        loc = lonlat_from_feature(feat)
        payload = {
            "name": name,
            "description": "Imported from GeoJSON",
            "mapbox_id": mapbox_id,          # matches your column
        }
        if loc:
            lat, lon = loc
            payload["location"] = f"{lat},{lon}"

        rows.append(payload)

    # bulk insert in chunks
    CHUNK = 500
    for i in range(0, len(rows), CHUNK):
        sb.table("beaches").insert(rows[i:i+CHUNK]).execute()

if __name__ == "__main__":
    main()
