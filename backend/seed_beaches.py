import json
import os
import requests
import time
import random
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

def delete_all_beaches():
    """Delete all records from the beaches table"""
    url = f"{SUPABASE_URL}/rest/v1/beaches"
    # Delete all records (no filter means delete everything)
    response = requests.delete(url, headers=HEADERS)
    response.raise_for_status()
    print("All beaches deleted from database")

def format_feature(feature):
    try:
        coords = feature["geometry"]["coordinates"]
        if len(coords) < 2:
            raise ValueError("Invalid coordinates")

        lat = coords[1]
        lon = coords[0]
        name = feature["properties"].get("name") or feature["properties"].get("place_name")
        if not name:
            raise ValueError("No name or place_name found")
        
        # Remove comma and everything after it if present
        if "," in name:
            name = name.split(",")[0].strip()
        
        # Priority-based mapbox_id setting
        mapbox_id = None
        
        # First, check if @id exists
        at_id = feature["properties"].get("@id")
        if at_id and len(at_id) > 5:
            try:
                mapbox_id = at_id[5:]
            except ValueError:
                pass  # Continue to next check if conversion fails
        
        # If no valid @id, check if mapbox_id already exists
        if mapbox_id is None:
            existing_mapbox_id = feature["properties"].get("mapbox_id")
            if existing_mapbox_id is not None:
                try:
                    mapbox_id = existing_mapbox_id
                except (ValueError, TypeError):
                    pass
        
        location = f"{lat}, {lon}"

        beach_data = {
            "name": name,
            "location": location,
            "description": "Imported from GeoJSON",
            "mapbox_id": mapbox_id
        }

        return beach_data

    except (KeyError, TypeError, ValueError) as e:
        print(f"Skipping invalid feature: {e}")
        return None


def seed_beaches(geojson_path, reset=False):
    if reset:
        print("Resetting database...")
        delete_all_beaches()
    
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
    # Set reset=True to clear database before seeding
    seed_beaches("fl beaches.geojson", reset=False)