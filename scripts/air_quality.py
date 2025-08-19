import openmeteo_requests

import pandas as pd
import requests_cache
from retry_requests import retry

# Setup the Open-Meteo API client with cache and retry on error
cache_session = requests_cache.CachedSession('.cache', expire_after = 3600)
retry_session = retry(cache_session, retries = 5, backoff_factor = 0.2)
openmeteo = openmeteo_requests.Client(session = retry_session)

def classify_us_aqi_PM25(value):
    """Classify US AQI PM2.5 value into categories."""
    if value <= 12:
        return "Good"
    elif value <= 35.4:
        return "Moderate"
    elif value <= 55.4:
        return "Unhealthy for Sensitive Groups"
    elif value <= 150.4:
        return "Unhealthy"
    elif value <= 250.4:
        return "Very Unhealthy"
    else:
        return "Hazardous"
def classify_us_aqi_PM10(value):
    """Classify US AQI PM10 value into categories."""
    if value <= 54:
        return "Good"
    elif value <= 154:
        return "Moderate"
    elif value <= 254:
        return "Unhealthy for Sensitive Groups"
    elif value <= 354:
        return "Unhealthy"
    elif value <= 424:
        return "Very Unhealthy"
    else:
        return "Hazardous"
def classify_us_aqi_nitrogen_dioxide(value):
    """Classify US AQI Nitrogen Dioxide value into categories."""
    if value <= 53:
        return "Good"
    elif value <= 100:
        return "Moderate"
    elif value <= 360:
        return "Unhealthy for Sensitive Groups"
    elif value <= 649:
        return "Unhealthy"
    elif value <= 1249:
        return "Very Unhealthy"
    else:
        return "Hazardous"
def classify_us_aqi_carbon_monoxide(value):
    """Classify US AQI Carbon Monoxide value into categories."""
    if value <= 4.4:
        return "Good"
    elif value <= 9.4:
        return "Moderate"
    elif value <= 12.4:
        return "Unhealthy for Sensitive Groups"
    elif value <= 15.4:
        return "Unhealthy"
    elif value <= 30.4:
        return "Very Unhealthy"
    else:
        return "Hazardous"
def classify_us_aqi_ozone(value):
    """Classify US AQI Ozone value into categories."""
    if value <= 54:
        return "Good"
    elif value <= 70:
        return "Moderate"
    elif value <= 85:
        return "Unhealthy for Sensitive Groups"
    elif value <= 105:
        return "Unhealthy"
    elif value <= 200:
        return "Very Unhealthy"
    else:
        return "Hazardous"
def classify_us_aqi_sulphur_dioxide(value):
    """Classify US AQI Sulphur Dioxide value into categories."""
    if value <= 35:
        return "Good"
    elif value <= 75:
        return "Moderate"
    elif value <= 185:
        return "Unhealthy for Sensitive Groups"
    elif value <= 304:
        return "Unhealthy"
    elif value <= 604:
        return "Very Unhealthy"
    else:
        return "Hazardous"

# Make sure all required weather variables are listed here
# The order of variables in hourly or daily is important to assign them correctly below
url = "https://air-quality-api.open-meteo.com/v1/air-quality"
params = {
	"latitude": 52.52,
	"longitude": 13.41,
	"hourly": ["us_aqi", "us_aqi_pm2_5", "us_aqi_pm10", "us_aqi_nitrogen_dioxide", "us_aqi_carbon_monoxide", "us_aqi_ozone", "us_aqi_sulphur_dioxide"],
	"current": "us_aqi",
	"forecast_days": 1,  # Only get data for today (1 day)
}
responses = openmeteo.weather_api(url, params=params)

# Process first location. Add a for-loop for multiple locations or weather models
response = responses[0]
print(f"Coordinates: {response.Latitude()}°N {response.Longitude()}°E")
print(f"Elevation: {response.Elevation()} m asl")
print(f"Timezone difference to GMT+0: {response.UtcOffsetSeconds()}s")

# Process current data. The order of variables needs to be the same as requested.
current = response.Current()
current_us_aqi = current.Variables(0).Value()

print(f"\nCurrent time: {current.Time()}")
print(f"Current us_aqi: {current_us_aqi}")

# Process hourly data. The order of variables needs to be the same as requested.
hourly = response.Hourly()
hourly_us_aqi = hourly.Variables(0).ValuesAsNumpy()
hourly_us_aqi_pm2_5 = hourly.Variables(1).ValuesAsNumpy()
hourly_us_aqi_pm10 = hourly.Variables(2).ValuesAsNumpy()
hourly_us_aqi_nitrogen_dioxide = hourly.Variables(3).ValuesAsNumpy()
hourly_us_aqi_carbon_monoxide = hourly.Variables(4).ValuesAsNumpy()
hourly_us_aqi_ozone = hourly.Variables(5).ValuesAsNumpy()
hourly_us_aqi_sulphur_dioxide = hourly.Variables(6).ValuesAsNumpy()

hourly_data = {"date": pd.date_range(
	start = pd.to_datetime(hourly.Time(), unit = "s", utc = True),
	end = pd.to_datetime(hourly.TimeEnd(), unit = "s", utc = True),
	freq = pd.Timedelta(seconds = hourly.Interval()),
	inclusive = "left"
)}

hourly_data["us_aqi"] = hourly_us_aqi
hourly_data["us_aqi_pm2_5"] = hourly_us_aqi_pm2_5
hourly_data["us_aqi_pm10"] = hourly_us_aqi_pm10
hourly_data["us_aqi_nitrogen_dioxide"] = hourly_us_aqi_nitrogen_dioxide
hourly_data["us_aqi_carbon_monoxide"] = hourly_us_aqi_carbon_monoxide
hourly_data["us_aqi_ozone"] = hourly_us_aqi_ozone
hourly_data["us_aqi_sulphur_dioxide"] = hourly_us_aqi_sulphur_dioxide

hourly_dataframe = pd.DataFrame(data = hourly_data)

# Limit to exactly 24 hours (one full day)
hourly_dataframe = hourly_dataframe.head(24)

# Classify hourly US AQI values
hourly_dataframe["us_aqi_class"] = hourly_dataframe["us_aqi"].apply(classify_us_aqi_PM25)
hourly_dataframe["us_aqi_pm2_5_class"] = hourly_dataframe["us_aqi_pm2_5"].apply(classify_us_aqi_PM25)
hourly_dataframe["us_aqi_pm10_class"] = hourly_dataframe["us_aqi_pm10"].apply(classify_us_aqi_PM10)
hourly_dataframe["us_aqi_nitrogen_dioxide_class"] = hourly_dataframe["us_aqi_nitrogen_dioxide"].apply(classify_us_aqi_nitrogen_dioxide)
hourly_dataframe["us_aqi_carbon_monoxide_class"] = hourly_dataframe["us_aqi_carbon_monoxide"].apply(classify_us_aqi_carbon_monoxide)
hourly_dataframe["us_aqi_ozone_class"] = hourly_dataframe["us_aqi_ozone"].apply(classify_us_aqi_ozone)
hourly_dataframe["us_aqi_sulphur_dioxide_class"] = hourly_dataframe["us_aqi_sulphur_dioxide"].apply(classify_us_aqi_sulphur_dioxide)    
print("\nHourly data with classifications\n", hourly_dataframe)