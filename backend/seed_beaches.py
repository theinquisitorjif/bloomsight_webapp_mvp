import json
import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def insert_row(table, payload):
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    response = requests.post(url, headers=HEADERS, json=payload)
    response.raise_for_status()
    return response.json()

def format_feature(feature):
    try:
        coords = feature["geometry"]["coordinates"]
        if len(coords) < 2:
            raise ValueError("Invalid coordinates")

        lat = coords[1]
        lon = coords[0]
        name = feature["properties"].get("name", "Unnamed Beach")
        location = f"{lat}, {lon}"

        return {
            "name": name,
            "location": location,
            "description": "Imported from GeoJSON"
        }

    except (KeyError, TypeError, ValueError) as e:
        print(f"Skipping invalid feature: {e}")
        return None


def seed_beaches(geojson_path):
    with open(geojson_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    features = data.get("features", [])
    total = 0

    for feature in features:
        beach = format_feature(feature)
        if not beach:
            continue
        try:
            insert_row("beaches", beach)
            total += 1
            print(f"Inserted: {beach['name']}")
        except Exception as e:
            print(f"Failed: {beach['name']}\n{e}")

    print(f"\n Done! {total} beaches seeded.")

if __name__ == "__main__":
    seed_beaches("backend/export.geojson")
