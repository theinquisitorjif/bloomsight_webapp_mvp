import requests
from datetime import datetime, timedelta

#Will need to have placed holders for each of the different stations base don the closest to the users desired beach location

def get_tide_predictions(station="8723970", start="today", end=None, datum="MLLW", interval="h"):
    url = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter"
    params = {
        "station": station,
        "product": "predictions",
        "datum": datum,
        "units": "english",
        "time_zone": "gmt",
        "format": "json",
        "interval": interval,
        "date": start if end is None else f"{start},{end}"
    }

    resp = requests.get(url, params=params)
    resp.raise_for_status()
    return resp.json().get("predictions", [])

def print_tide_changes(predictions):
    print("Time (UTC)         | Height (ft) | Δ since previous")
    print("-------------------|-------------|-----------------")
    last = None
    for p in predictions:
        t = p["t"]
        h = float(p["v"])
        delta = (h - last) if last is not None else None
        print(f"{t} | {h:6.3f}     | {delta:+6.3f}" if delta is not None else f"{t} | {h:6.3f}     |      ---")
        last = h

def get_high_low_tides(station="8723970", date="today"):
    url = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter"
    params = {
        "station": station,
        "product": "predictions",
        "datum": "MLLW",
        "units": "english",
        "time_zone": "gmt",
        "format": "json",
        "interval": "hilo",  # only high and low tides
        "date": date
    }

    response = requests.get(url, params=params)
    response.raise_for_status()
    return response.json().get("predictions", [])

def print_tide_turning_points(predictions):
    print("Time (GMT)               | Tide Height (ft) | Type")
    print("-------------------------|------------------|--------")
    for p in predictions:
        print(f"{p['t']}      | {p['v']} ft          | {p['type']}")

if __name__ == "__main__":
    # Get and display high/low tides
    tides = get_high_low_tides()
    if tides:
        print("📈 Today's High/Low Tides for Vaca Key (Station 8723970):")
        print_tide_turning_points(tides)
        print()  # Add spacing between outputs
    else:
        print("No high/low tide data returned.")
    
    # Get and display hourly tide predictions
    preds = get_tide_predictions(start="today")
    if preds:
        print("📊 Hourly Tide Predictions:")
        print_tide_changes(preds)
    else:
        print("No hourly predictions returned. Check station, dates, or API parameters.")
