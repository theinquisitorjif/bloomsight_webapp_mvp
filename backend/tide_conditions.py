import requests
from datetime import datetime, timedelta, timezone
from math import radians, cos, sin, sqrt, atan2
from geopy.geocoders import Nominatim

# NOAA stations list
NOAA_STATIONS = [
    {"id": "8723970", "name": "Vaca Key", "lat": 24.636, "lon": -81.377},
    {"id": "8724580", "name": "Key West", "lat": 24.555, "lon": -81.783},
    {"id": "8723170", "name": "Miami", "lat": 25.766, "lon": -80.133},
    {"id": "8724581", "name": "Fort Myers", "lat": 26.640, "lon": -81.870},
    {"id": "8725520", "name": "Tampa", "lat": 27.904, "lon": -82.476},
    {"id": "8723214", "name": "West Palm Beach", "lat": 26.753, "lon": -80.056},
    # Add more stations as needed
]

# Haversine distance
def haversine(lat1, lon1, lat2, lon2):
    R = 3958.8  # miles
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

# Find nearest NOAA station
def find_nearest_station(lat, lon):
    return min(NOAA_STATIONS, key=lambda s: haversine(lat, lon, s["lat"], s["lon"]))

# Get beach coordinates
def get_beach_coordinates(beach_name):
    geolocator = Nominatim(user_agent="beach_tide_locator")
    location = geolocator.geocode(beach_name)
    if not location:
        raise ValueError(f"Could not find location for {beach_name}")
    return location.latitude, location.longitude, location.address

# Fetch tide predictions
def get_tide_prediction_json(lat, lon, beach_name):
    # Find nearest NOAA station
    station_info = find_nearest_station(lat, lon)
    station_id = station_info["id"]

    url = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter"

    now = datetime.now(timezone.utc)
    start_filter = now - timedelta(hours=4)
    end_filter = now + timedelta(hours=8)

    begin_date = start_filter.strftime("%Y%m%d")
    end_date = end_filter.strftime("%Y%m%d")

    # --- Hourly predictions ---
    params_hourly = {
        "station": station_id,
        "product": "predictions",
        "datum": "MLLW",
        "units": "english",
        "time_zone": "gmt",
        "format": "json",
        "interval": "h",
        "begin_date": begin_date,
        "end_date": end_date
    }

    resp_hourly = requests.get(url, params=params_hourly)
    resp_hourly.raise_for_status()
    hourly_preds = resp_hourly.json().get("predictions", [])

    filtered_hourly = [
        {"time": p["t"], "height": float(p["v"])}
        for p in hourly_preds
        if start_filter <= datetime.strptime(p["t"], "%Y-%m-%d %H:%M").replace(tzinfo=timezone.utc) <= end_filter
    ]

    # --- Generate synthetic past values ---
    if len(filtered_hourly) >= 2:
        first_val = filtered_hourly[0]["height"]
        second_val = filtered_hourly[1]["height"]
        rising = second_val > first_val

        step = abs(second_val - first_val)  # change per hour
        # If change is too small, give a small default
        step = step if step > 0.01 else 0.05

        synthetic_points = []
        for i in range(4, 0, -1):
            ts = (datetime.strptime(filtered_hourly[0]["time"], "%Y-%m-%d %H:%M") - timedelta(hours=i))
            if rising:
                # Go backwards, so values decrease as we move earlier
                val = first_val - step * (4 - i + 1)
            else:
                # Go backwards, so values increase as we move earlier
                val = first_val + step * (4 - i + 1)
            synthetic_points.append({
                "time": ts.strftime("%Y-%m-%d %H:%M"),
                "height": round(val, 3)
            })

        filtered_hourly = synthetic_points + filtered_hourly

    # --- High/Low tides ---
    params_hilo = {
        "station": station_id,
        "product": "predictions",
        "datum": "MLLW",
        "units": "english",
        "time_zone": "gmt",
        "format": "json",
        "interval": "hilo",
        "begin_date": begin_date,
        "end_date": end_date
    }
    resp_hilo = requests.get(url, params=params_hilo)
    resp_hilo.raise_for_status()
    hilo_preds = resp_hilo.json().get("predictions", [])

    high_tide = next(
        (p for p in hilo_preds if datetime.strptime(p["t"], "%Y-%m-%d %H:%M").replace(tzinfo=timezone.utc) >= now and p["type"].lower() == "h"),
        None
    )
    low_tide = next(
        (p for p in hilo_preds if datetime.strptime(p["t"], "%Y-%m-%d %H:%M").replace(tzinfo=timezone.utc) >= now and p["type"].lower() == "l"),
        None
    )

    return {
        "beach_name": beach_name,
        "station_id": station_id,
        "station_name": station_info["name"],
        "low_tide": {"time": low_tide["t"], "height": float(low_tide["v"])} if low_tide else None,
        "high_tide": {"time": high_tide["t"], "height": float(high_tide["v"])} if high_tide else None,
        "tides": filtered_hourly
    }