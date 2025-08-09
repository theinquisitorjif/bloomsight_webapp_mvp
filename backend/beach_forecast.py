import openmeteo_requests, pandas as pd, requests_cache
from retry_requests import retry
from datetime import datetime
from typing import Dict, Any

def fetch_open_meteo(lat: float, lon: float) -> Dict[str, Any]:
    cache_session = requests_cache.CachedSession('.cache', expire_after=1800)
    session = retry(cache_session, retries=3, backoff_factor=0.3)
    client = openmeteo_requests.Client(session=session)

    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat, "longitude": lon,
        "current": ["temperature_2m","precipitation","rain","wind_speed_10m","wind_gusts_10m",
                    "is_day","cloud_cover","weathercode","relative_humidity_2m","uv_index"],
        "hourly": ["temperature_2m","weather_code","wind_speed_10m","wind_gusts_10m","cloud_cover",
                   "rain","precipitation_probability","relative_humidity_2m","uv_index"],
        "forecast_days": 1,
    }
    resp = client.weather_api(url, params=params)[0]

    # current
    cur = resp.Current()
    current = {
        "temperature_2m": cur.Variables(0).Value(),
        "precipitation":   cur.Variables(1).Value(),
        "rain":            cur.Variables(2).Value(),
        "wind_speed_10m":  cur.Variables(3).Value(),
        "wind_gusts_10m":  cur.Variables(4).Value(),
        "is_day":          int(cur.Variables(5).Value()),
        "cloud_cover":     cur.Variables(6).Value(),
        "weathercode":     int(cur.Variables(7).Value()),
        "relative_humidity_2m": cur.Variables(8).Value(),
        "uv_index":        cur.Variables(9).Value(),
        "timestamp": datetime.utcnow().isoformat()
    }

    # hourly (trim to 7:00–20:00 if you like)
    hourly = resp.Hourly()
    times = pd.date_range(
        start=pd.to_datetime(hourly.Time(), unit="s", utc=True),
        end=pd.to_datetime(hourly.TimeEnd(), unit="s", utc=True),
        freq=pd.Timedelta(seconds=hourly.Interval()),
        inclusive="left"
    )

    def arr(i): return hourly.Variables(i).ValuesAsNumpy().tolist()
    hourly_points = []
    for i, t in enumerate(times):
        hourly_points.append({
            "time": t.isoformat(),
            "temperature_2m":           arr(0)[i],
            "weather_code":             int(arr(1)[i]),
            "wind_speed_10m":           arr(2)[i],
            "wind_gusts_10m":           arr(3)[i],
            "cloud_cover":              arr(4)[i],
            "rain":                     arr(5)[i],
            "precipitation_probability":arr(6)[i],
            "relative_humidity_2m":     arr(7)[i],
            "uv_index":                 arr(8)[i],
        })

    return {"current": current, "hourly": hourly_points}
