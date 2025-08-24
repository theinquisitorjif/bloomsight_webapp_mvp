import json
import os
import requests
import time
from supabase_client import init_supabase
from dotenv import load_dotenv

supabase = init_supabase()

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY")
UNSPLASH_ACCESS_KEY = os.environ.get("UNSPLASH_ACCESS_KEY")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

if __name__ == "__main__":
    beaches = supabase.table("beaches").select("mapbox_id, name").execute().data

    for i, beach in enumerate(beaches):
        beach_id = beach["mapbox_id"]
        beach_name = beach["name"]

        print(f"[{i+1}/{len(beaches)}] Searching Unsplash for {beach_name}...")

        res = requests.get(
            "https://api.unsplash.com/search/photos",
            params={
                "query": beach_name + ", Florida, USA",
                "per_page": 1,
            },
            headers={
                "Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"
            },
        )

        if res.status_code != 200:
            print("❌ Unsplash error:", res.text)
            continue

        results = res.json().get("results", [])
        if not results:
            print(f"⚠️ No results for {beach_name}")
            continue

        image_url = results[0]["urls"]["regular"]

        print(f"✅ Found {image_url}")

        supabase.table("pictures").insert({
            "mapbox_id": beach_id,
            "image_url": image_url,
        }).execute()

         # Respect Unsplash free tier: 50 requests/hour ≈ 1 every 72s
        time.sleep(0.5)  # adjust if you upgraded your API plan