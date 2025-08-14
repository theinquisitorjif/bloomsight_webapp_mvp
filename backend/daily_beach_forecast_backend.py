import requests_cache
from retry_requests import retry
import openmeteo_requests
import numpy as np
import requests

# -----------------------------
# Setup Open-Meteo API Client
# -----------------------------
cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
retry_session = retry(cache_session, retries=10, backoff_factor=0.2)
openmeteo = openmeteo_requests.Client(session=retry_session)

# Weather code mapping
WEATHER_CODES = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Fog",
    51: "Drizzle",
    53: "Drizzle",
    55: "Drizzle",
    61: "Rain Showers",
    63: "Rain Showers",
    65: "Rain Showers",
    71: "Snow Showers",
    73: "Snow Showers",
    75: "Snow Showers"
}

# -----------------------------
# Fetch beach forecast
# -----------------------------
def get_beach_forecast(lat, lon):
    def safe_values(var):
        try:
            vals = var.ValuesAsNumpy()
            if np.isscalar(vals):
                return [float(vals)]
            else:
                return [float(v) for v in vals.tolist()]
        except Exception:
            return [None] * 7

    # --- 1. Main Forecast ---
    url_forecast = "https://api.open-meteo.com/v1/forecast"
    params_forecast = {
        "latitude": lat,
        "longitude": lon,
        "daily": ",".join([
            "temperature_2m_max", "temperature_2m_min",
            "weather_code", "wind_speed_10m_max",
            "wind_direction_10m_dominant",
            "wind_gusts_10m_max",
            "precipitation_probability_max", "uv_index_max",
            "relative_humidity_2m_max",
            "sunrise", "sunset"
        ]),
        "forecast_days": 7,
        "timezone": "auto",
        "temperature_unit": "fahrenheit",
    }
    forecast_responses = openmeteo.weather_api(url_forecast, params=params_forecast)
    forecast_daily = forecast_responses[0].Daily()

    def var_list(idx, as_int=False):
        vals = forecast_daily.Variables(idx).ValuesAsNumpy()
        if np.isscalar(vals):
            return [int(vals) if as_int else float(vals)]
        else:
            return [int(v) if as_int else float(v) for v in vals.tolist()]

    temp_max = var_list(0)
    temp_min = var_list(1)
    weather_code = var_list(2, as_int=True)
    wind_speed = var_list(3)
    wind_dir = var_list(4)
    gust_speed = var_list(5)
    precipitation = safe_values(forecast_daily.Variables(6))
    uv_index = safe_values(forecast_daily.Variables(7))
    humidity = safe_values(forecast_daily.Variables(8))

    # --- 2. Sunrise and Sunset ---
    res = requests.get(
        "https://api.open-meteo.com/v1/forecast",
        params={
            "latitude": lat,
            "longitude": lon,
            "daily": "sunrise,sunset",
            "forecast_days": 7,
            "timezone": "auto"
        }
    ).json()
    sunrise = res["daily"]["sunrise"]
    sunset = res["daily"]["sunset"]

    # --- 3. Air Quality ---
    url_air = "https://air-quality-api.open-meteo.com/v1/air-quality"
    params_air = {
        "latitude": lat,
        "longitude": lon,
        "hourly": "pm10",
        "forecast_days": 5,
        "timezone": "auto"
    }
    air_responses = openmeteo.weather_api(url_air, params=params_air)
    air_hourly = air_responses[0].Hourly()
    try:
        pm10_values = air_hourly.Variables(0).ValuesAsNumpy()
        air_quality_daily = [
            float(np.nanmean(pm10_values[i:i+24])) if len(pm10_values[i:i+24]) > 0 else None
            for i in range(0, len(pm10_values), 24)
        ]
        air_quality_daily += [None] * (7 - len(air_quality_daily))
    except Exception:
        air_quality_daily = [None] * 7

    # --- 4. Merge into daily dictionaries ---
    return [
        {
            "temp_max": float(temp_max[i]),
            "temp_min": float(temp_min[i]),
            "weather_code": int(weather_code[i]),
            "wind_speed": float(wind_speed[i]),
            "wind_dir": float(wind_dir[i]),
            "gust_speed": float(gust_speed[i]),
            "precipitation": float(precipitation[i]) if precipitation[i] is not None else None,
            "uv_index": float(uv_index[i]) if uv_index[i] is not None else None,
            "humidity": float(humidity[i]) if humidity[i] is not None else None,
            "sunrise": sunrise[i],
            "sunset": sunset[i],
            "air_quality": float(air_quality_daily[i]) if air_quality_daily[i] is not None else None
        } for i in range(7)
    ]