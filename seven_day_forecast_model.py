#This is the 7-day beach forecast model that pulls in data from Open-Meteo API

import openmeteo_requests
import pandas as pd
import requests_cache
from retry_requests import retry
from datetime import datetime

#eventually this will pull horuly data and provide a recommendation on the best day and hour.

#Pull in data from Open-Meteo API
# Setup the Open-Meteo API client with cache and retry on error
cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
openmeteo = openmeteo_requests.Client(session=retry_session)

# Make sure all required weather variables are listed here
url = "https://api.open-meteo.com/v1/forecast"
params = {
	"latitude": 29.651634,
	"longitude": -82.324826,
	"daily": ["temperature_2m_max", "temperature_2m_min", "weather_code", "wind_speed_10m_max", "wind_gusts_10m_max", "precipitation_sum", "precipitation_probability_max", "uv_index_max"],
	"forecast_days": 7,
}
responses = openmeteo.weather_api(url, params=params)

# Process first location
response = responses[0]
print(f"Coordinates: {response.Latitude()}°N {response.Longitude()}°E")
print(f"Elevation: {response.Elevation()} m asl")
print(f"Timezone difference to GMT+0: {response.UtcOffsetSeconds()}s")

# Get current time
current_time = datetime.now()
current_time_formatted = current_time.strftime("%Y-%m-%d %H:%M:%S")

# Process daily data
daily = response.Daily()
daily_temperature_2m_max = daily.Variables(0).ValuesAsNumpy()
daily_temperature_2m_min = daily.Variables(1).ValuesAsNumpy()
daily_weather_code = daily.Variables(2).ValuesAsNumpy()
daily_wind_speed_10m_max = daily.Variables(3).ValuesAsNumpy()
daily_wind_gusts_10m_max = daily.Variables(4).ValuesAsNumpy()
daily_precipitation_sum = daily.Variables(5).ValuesAsNumpy()
daily_precipitation_probability_max = daily.Variables(6).ValuesAsNumpy()
daily_uv_index_max = daily.Variables(7).ValuesAsNumpy()

# Calculate daily average air quality
daily_data = {"date": pd.date_range(
	start = pd.to_datetime(daily.Time(), unit = "s", utc = True),
	end = pd.to_datetime(daily.TimeEnd(), unit = "s", utc = True),
	freq = pd.Timedelta(seconds = daily.Interval()),
	inclusive = "left"
)}

daily_data["temperature_2m_max"] = daily_temperature_2m_max
daily_data["temperature_2m_min"] = daily_temperature_2m_min
daily_data["weather_code"] = daily_weather_code
daily_data["wind_speed_10m_max"] = daily_wind_speed_10m_max
daily_data["wind_gusts_10m_max"] = daily_wind_gusts_10m_max
daily_data["precipitation_sum"] = daily_precipitation_sum
daily_data["precipitation_probability_max"] = daily_precipitation_probability_max
daily_data["uv_index_max"] = daily_uv_index_max

daily_dataframe = pd.DataFrame(data = daily_data)
print(f"\n7-Day Daily Forecast (as of {current_time_formatted}):")
print(daily_dataframe)

#Create beach class model for daily forecasts

class DailyBeachClassModel: 
    def __init__(self, temp_max, temp_min, weather_code, wind_speed_max, wind_gusts_max, precipitation_sum, precipitation_probability, uv_index_max):
        self.temp_max = temp_max
        self.temp_min = temp_min
        self.weather_code = weather_code
        self.wind_speed_max = wind_speed_max
        self.wind_gusts_max = wind_gusts_max
        self.precipitation_sum = precipitation_sum
        self.precipitation_probability = precipitation_probability
        self.uv_index_max = uv_index_max

    def classify_daily_temp(self):
        avg_temp = (self.temp_max + self.temp_min) / 2
        if avg_temp > 30:
            return "Hot"
        elif avg_temp > 24:
            return "Good"
        elif avg_temp > 20:
            return "Acceptable"
        elif avg_temp > 15:
            return "Cool"
        else:
            return "Cold"
    
    def classify_daily_temp_range(self):
        temp_range = self.temp_max - self.temp_min
        if temp_range > 15:
            return "Large variation"
        elif temp_range > 10:
            return "Moderate variation"
        else:
            return "Stable"
        
    def classify_daily_precipitation(self):
        if self.precipitation_sum > 10:
            return "Heavy Rain"
        elif self.precipitation_sum > 2:
            return "Light Rain"
        elif self.precipitation_sum > 0:
            return "Drizzle"
        else:
            return "Dry"
    
    def classify_daily_precipitation_chance(self):
        if self.precipitation_probability > 80:
            return "Very High Chance"
        elif self.precipitation_probability > 60:
            return "High Chance"
        elif self.precipitation_probability > 40:
            return "Moderate Chance"
        elif self.precipitation_probability > 20:
            return "Low Chance"
        else:
            return "Very Low Chance"
    
    def classify_daily_wind(self):
        if self.wind_speed_max > 15:
            return "Very Windy"
        elif self.wind_speed_max > 10:
            return "Windy"
        elif self.wind_speed_max > 5:
            return "Breezy"
        else:
            return "Calm"
    
    def classify_daily_wind_gusts(self):
        if self.wind_gusts_max > 25:
            return "Dangerous Gusts"
        elif self.wind_gusts_max > 20:
            return "Strong Gusts"
        elif self.wind_gusts_max > 15:
            return "Moderate Gusts"
        else:
            return "Light Gusts"
    
    def classify_daily_uv_index(self):
        if self.uv_index_max >= 11:
            return "Extreme (Dangerous)"
        elif self.uv_index_max >= 8:
            return "Very High (Protection needed)"
        elif self.uv_index_max >= 6:
            return "High (Protection recommended)"
        elif self.uv_index_max >= 3:
            return "Moderate (Some protection)"
        elif self.uv_index_max >= 1:
            return "Low (Minimal risk)"
        else:
            return "None"
    
    def classify_daily_weather_code(self):
        if self.weather_code == 0:
            return "Clear Sky"
        elif self.weather_code == 1:
            return "Mainly Clear"
        elif self.weather_code == 2:
            return "Partly Cloudy"
        elif self.weather_code == 3:
            return "Overcast"
        elif self.weather_code in [45, 48]:
            return "Fog"
        elif self.weather_code in [51, 53, 55]:
            return "Drizzle"
        elif self.weather_code in [61, 63, 65]:
            return "Rain Showers"
        elif self.weather_code in [71, 73, 75]:
            return "Snow Showers"
        else:
            return "Unknown Weather Code"

    def classify_daily_beach_conditions(self):
        temp_class = self.classify_daily_temp()
        temp_range_class = self.classify_daily_temp_range()
        precipitation_class = self.classify_daily_precipitation()
        precipitation_chance_class = self.classify_daily_precipitation_chance()
        wind_class = self.classify_daily_wind()
        wind_gusts_class = self.classify_daily_wind_gusts()
        uv_class = self.classify_daily_uv_index()
        weather_code_class = self.classify_daily_weather_code()

        return {
            "Temperature": temp_class,
            "Temperature Range": temp_range_class,
            "Precipitation": precipitation_class,
            "Rain Chance": precipitation_chance_class,
            "Wind": wind_class,
            "Wind Gusts": wind_gusts_class,
            "UV Index": uv_class,
            "Weather": weather_code_class
        }
    
    def classify_daily_beach_overall(self):
        conditions = self.classify_daily_beach_conditions()
        if (conditions["Temperature"] in ["Hot", "Good"] and 
            conditions["Precipitation"] == "Dry" and 
            conditions["Rain Chance"] in ["Very Low Chance", "Low Chance"] and
            conditions["Wind"] in ["Calm", "Breezy"] and
            conditions["Wind Gusts"] in ["Light Gusts", "Moderate Gusts"] and
            conditions["UV Index"] not in ["Extreme (Dangerous)"]):
            return "🌟 Ideal Beach Day"
        elif (conditions["Temperature"] in ["Good", "Acceptable"] and 
              conditions["Precipitation"] in ["Dry", "Drizzle"] and
              conditions["Rain Chance"] not in ["Very High Chance"] and
              conditions["Wind Gusts"] != "Dangerous Gusts" and
              conditions["UV Index"] != "Extreme (Dangerous)"):
            return "✅ Good Beach Day"
        elif (conditions["Temperature"] in ["Cool", "Cold"] or 
              conditions["Precipitation"] in ["Heavy Rain"] or
              conditions["Rain Chance"] == "Very High Chance" or
              conditions["Wind Gusts"] == "Dangerous Gusts" or
              conditions["UV Index"] == "Extreme (Dangerous)"):
            return "❌ Not Suitable for Beach"
        else:
            return "⚠️ Acceptable Beach Day"

# Display 7-day beach forecast
print("\n" + "="*80)
print("7-DAY BEACH FORECAST")
print("="*80)

for i in range(7):
    daily_model = DailyBeachClassModel(
        temp_max=daily_temperature_2m_max[i],
        temp_min=daily_temperature_2m_min[i],
        weather_code=daily_weather_code[i],
        wind_speed_max=daily_wind_speed_10m_max[i],
        wind_gusts_max=daily_wind_gusts_10m_max[i],
        precipitation_sum=daily_precipitation_sum[i],
        precipitation_probability=daily_precipitation_probability_max[i],
        uv_index_max=daily_uv_index_max[i]
    )
    
    daily_conditions = daily_model.classify_daily_beach_conditions()
    daily_overall = daily_model.classify_daily_beach_overall()
    
    # Get the date for this day
    forecast_date = daily_dataframe['date'].iloc[i]
    day_name = forecast_date.strftime('%A')

# Summary
print("\n" + "="*80)
print("WEEKLY SUMMARY")
print("="*80)

ideal_days = []
good_days = []
acceptable_days = []
unsuitable_days = []

for i in range(7):
    daily_model = DailyBeachClassModel(
        temp_max=daily_temperature_2m_max[i],
        temp_min=daily_temperature_2m_min[i],
        weather_code=daily_weather_code[i],
        wind_speed_max=daily_wind_speed_10m_max[i],
        wind_gusts_max=daily_wind_gusts_10m_max[i],
        precipitation_sum=daily_precipitation_sum[i],
        precipitation_probability=daily_precipitation_probability_max[i],
        uv_index_max=daily_uv_index_max[i]
    )
    
    daily_overall = daily_model.classify_daily_beach_overall()
    day_name = daily_dataframe['date'].iloc[i].strftime('%A')
    
    if "Ideal" in daily_overall:
        ideal_days.append(day_name)
    elif "Good" in daily_overall:
        good_days.append(day_name)
    elif "Acceptable" in daily_overall:
        acceptable_days.append(day_name)
    else:
        unsuitable_days.append(day_name)

print(f"🌟 Ideal Beach Days: {', '.join(ideal_days) if ideal_days else 'None'}")
print(f"✅ Good Beach Days: {', '.join(good_days) if good_days else 'None'}")
print(f"⚠️ Acceptable Beach Days: {', '.join(acceptable_days) if acceptable_days else 'None'}")
print(f"❌ Unsuitable Days: {', '.join(unsuitable_days) if unsuitable_days else 'None'}")

if ideal_days:
    print(f"\n🏖️ Best days for beach activities: {', '.join(ideal_days)}")
elif good_days:
    print(f"\n☀️ Recommended beach days: {', '.join(good_days)}")
else:
    print(f"\n🌧️ Consider indoor activities this week or check hourly forecasts for better windows")
