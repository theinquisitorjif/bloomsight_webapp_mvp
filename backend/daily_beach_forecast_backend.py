import pandas as pd
from datetime import datetime
import requests_cache
from retry_requests import retry
import openmeteo_requests
import json

# -----------------------------
# Setup Open-Meteo API Client
# -----------------------------
cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
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
# Daily Beach Forecast Model
# -----------------------------
class DailyBeachForecast:
    def __init__(self, temp_max, temp_min, weather_code, wind_speed, wind_dir,
                 gust_speed, gust_dir, precipitation, uv_index, humidity,
                 sunrise_time, sunset_time, water_temp, air_quality):
        self.temp_max = temp_max
        self.temp_min = temp_min
        self.weather_code = weather_code
        self.wind_speed = wind_speed
        self.wind_dir = wind_dir
        self.gust_speed = gust_speed
        self.gust_dir = gust_dir
        self.precipitation = precipitation
        self.uv_index = uv_index
        self.humidity = humidity
        self.sunrise_time = sunrise_time
        self.sunset_time = sunset_time
        self.water_temp = water_temp
        self.air_quality = air_quality

    def get_weathercode_description(self):
        return WEATHER_CODES.get(self.weather_code, "Unknown")

    def calculate_recommendation(self):
        """Score 0-5 based on weather factors"""
        score = 0
        avg_temp = (self.temp_max + self.temp_min)/2
        if 20 <= avg_temp <= 30:
            score += 2
        if self.precipitation < 1:
            score += 1
        if self.wind_speed < 10:
            score += 1
        if self.uv_index < 8:
            score += 1
        return min(score, 5)

    def to_dict(self):
        """Return a JSON-compatible dictionary"""
        return {
            "low": self.temp_min,
            "high": self.temp_max,
            "current": (self.temp_max + self.temp_min)/2,
            "weathercode": self.get_weathercode_description(),
            "sunrise_time": self.sunrise_time,
            "sunset_time": self.sunset_time,
            "humidity": self.humidity,
            "uv_index": self.uv_index,
            "precipitation": self.precipitation,
            "wind": {"speed": self.wind_speed, "direction": self.wind_dir},
            "gust_speed": {"speed": self.gust_speed, "direction": self.gust_dir},
            "air_quality": self.air_quality,
            "water_temperature": self.water_temp,
            "recommendation": self.calculate_recommendation()
        }

# -----------------------------
# Fetch beach forecast
# -----------------------------
def get_beach_forecast(lat, lon):
    """
    Fetch daily beach forecast for any latitude/longitude
    Returns DailyBeachForecast object
    """
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": [
            "temperature_2m_max", "temperature_2m_min",
            "weather_code", "wind_speed_10m_max", "wind_direction_10m_dominant",
            "wind_gusts_10m_max", "wind_gusts_direction_10m_dominant",
            "precipitation_sum", "uv_index_max", "humidity_2m_max",
            "sunrise", "sunset", "water_temperature_2m", "air_quality_index_pm10"
        ],
        "forecast_days": 1
    }

    responses = openmeteo.weather_api(url, params=params)
    response = responses[0]
    daily = response.Daily()

    # Helper function to safely extract values
    def get_value(variable_index):
        try:
            return daily.Variables(variable_index).ValuesAsNumpy()[0]
        except Exception:
            return None

    return DailyBeachForecast(
        temp_max=get_value(0),
        temp_min=get_value(1),
        weather_code=int(get_value(2)) if get_value(2) is not None else 0,
        wind_speed=get_value(3) or 0,
        wind_dir=get_value(4) or 0,
        gust_speed=get_value(5) or 0,
        gust_dir=get_value(6) or 0,
        precipitation=get_value(7) or 0,
        uv_index=get_value(8) or 0,
        humidity=get_value(9) or 0,
        sunrise_time=get_value(10),
        sunset_time=get_value(11),
        water_temp=get_value(12),
        air_quality=get_value(13)
    )