import os
from supabase_client import init_supabase
from datetime import datetime, timezone, timedelta
from daily_beach_forecast_backend import get_beach_forecast
from dotenv import load_dotenv

supabase = init_supabase()

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

if __name__ == "__main__":
    beach_data = supabase.table('beaches').select('*').execute()
    if not beach_data.data:
        print("No beaches found")
        exit(1)

    for beach in beach_data.data:
        mapbox_id = beach['mapbox_id']
        lat_str, lon_str = beach['location'].split(",")
        lat, lon = float(lat_str.strip()), float(lon_str.strip())
        forecasts = get_beach_forecast(lat, lon)

        if not len(forecasts):
            print(f"Beach {mapbox_id} forecast not found")
            continue

        supabase.table('beaches').update({
            'forecast': forecasts,
            'last_updated': datetime.now(timezone.utc).isoformat()
        }).eq('mapbox_id', mapbox_id).execute()

        print(f"Beach {mapbox_id} forecast updated")