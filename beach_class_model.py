#This is the hourly beach forecast model that pulls in data from Open-Meteo API

import openmeteo_requests
import pandas as pd
import requests_cache
from retry_requests import retry
from datetime import datetime

#add lighstning data later

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
	"current": ["temperature_2m", "precipitation", "rain", "wind_speed_10m", "wind_gusts_10m", "is_day", "cloud_cover", "weathercode", "relative_humidity_2m", "uv_index"],
	"hourly": ["temperature_2m", "weather_code", "wind_speed_10m", "wind_gusts_10m", "cloud_cover", "rain", "precipitation_probability", "relative_humidity_2m", "uv_index"],
	"forecast_days": 1,
}
responses = openmeteo.weather_api(url, params=params)

# Process first location. Add a for-loop for multiple locations or weather models
response = responses[0]
print(f"Coordinates: {response.Latitude()}°N {response.Longitude()}°E")
print(f"Elevation: {response.Elevation()} m asl")
print(f"Timezone difference to GMT+0: {response.UtcOffsetSeconds()}s")

# Get current time
current_time = datetime.now()
current_time_formatted = current_time.strftime("%Y-%m-%d %H:%M:%S")

# Process current data first
current = response.Current()
current_temperature_2m = current.Variables(0).Value()
current_precipitation = current.Variables(1).Value()
current_rain = current.Variables(2).Value()
current_wind_speed_10m = current.Variables(3).Value()
current_wind_gusts_10m = current.Variables(4).Value()
current_is_day = current.Variables(5).Value()
current_cloud_cover = current.Variables(6).Value()
current_weathercode = current.Variables(7).Value()
current_relative_humidity_2m = current.Variables(8).Value()
current_uv_index = current.Variables(9).Value()

#Print current weather data
print(f"\nCurrent Weather Data (as of {current_time_formatted}):")
print(f"Current Temperature: {current_temperature_2m}°C")
print(f"Current Precipitation: {current_precipitation}mm")
print(f"Current Rain: {current_rain}mm")
print(f"Current Wind Speed: {current_wind_speed_10m * 3.6:.1f}km/h")
print(f"Current Wind Gusts: {current_wind_gusts_10m * 3.6:.1f}km/h")
print(f"Current Humidity: {current_relative_humidity_2m}%")
print(f"Current UV Index: {current_uv_index}")
print(f"Is it Daytime? {'Yes' if current_is_day else 'No'}")
print(f"Current Cloud Cover: {current_cloud_cover}%")
print(f"Current Weather Code: {current_weathercode}")

# Process hourly data. The order of variables needs to be the same as requested.
hourly = response.Hourly()
hourly_temperature_2m = hourly.Variables(0).ValuesAsNumpy()
hourly_weather_code = hourly.Variables(1).ValuesAsNumpy()
hourly_wind_speed_10m = hourly.Variables(2).ValuesAsNumpy()
hourly_wind_gusts_10m = hourly.Variables(3).ValuesAsNumpy()
hourly_cloud_cover = hourly.Variables(4).ValuesAsNumpy()
hourly_rain = hourly.Variables(5).ValuesAsNumpy()
hourly_precipitation_probability = hourly.Variables(6).ValuesAsNumpy()
hourly_relative_humidity_2m = hourly.Variables(7).ValuesAsNumpy()
hourly_uv_index = hourly.Variables(8).ValuesAsNumpy()

hourly_data = {"date": pd.date_range(
	start = pd.to_datetime(hourly.Time(), unit = "s", utc = True),
	end = pd.to_datetime(hourly.TimeEnd(), unit = "s", utc = True),
	freq = pd.Timedelta(seconds = hourly.Interval()),
	inclusive = "left"
)}

hourly_data["temperature_2m"] = hourly_temperature_2m
hourly_data["weather_code"] = hourly_weather_code
hourly_data["wind_speed_10m"] = hourly_wind_speed_10m
hourly_data["wind_gusts_10m"] = hourly_wind_gusts_10m
hourly_data["cloud_cover"] = hourly_cloud_cover
hourly_data["rain"] = hourly_rain
hourly_data["precipitation_probability"] = hourly_precipitation_probability
hourly_data["relative_humidity_2m"] = hourly_relative_humidity_2m
hourly_data["uv_index"] = hourly_uv_index

hourly_dataframe = pd.DataFrame(data = hourly_data)
print("\nHourly data\n", hourly_dataframe)

#Create beach class model 

class BeachClassModel: 
    def __init__(self, temperature, precipitation, rain, wind_speed, wind_gusts, is_day, cloud_cover, weather_code, humidity, uv_index):
        self.temperature = temperature
        self.precipitation = precipitation
        self.rain = rain
        self.wind_speed = wind_speed
        self.wind_gusts = wind_gusts
        self.is_day = is_day
        self.cloud_cover = cloud_cover
        self.weather_code = weather_code
        self.humidity = humidity
        self.uv_index = uv_index

    def classify_beach_temp(self):
        if self.temperature > 32:
            return "Hot"
        elif self.temperature > 22:
            return "Good"
        elif self.temperature > 18:
            return "Acceptable"
        elif self.temperature > 10:
            return "Cold"
        else:
            return "Very Cold"
        
    def classify_beach_rain(self):
        if self.rain > 5:
            return "Heavy Rain"
        elif self.rain > 1:
            return "Light Rain"
        else:
            return "Dry"
    
    def classify_beach_precipitation_chance(self):
        if self.precipitation > 80:
            return "Very High Chance"
        elif self.precipitation > 60:
            return "High Chance"
        elif self.precipitation > 40:
            return "Moderate Chance"
        elif self.precipitation > 20:
            return "Low Chance"
        else:
            return "Very Low Chance"
    def classify_beach_wind(self):
        if self.wind_speed > 13:
            return "Very Strong Winds"
        elif self.wind_speed > 9:
            return "Windy"
        elif self.wind_speed > 2:
            return "Nice Breeze"
        else:
            return "Calm"
    
    def classify_beach_wind_gusts(self):
        if self.wind_gusts > 20:
            return "Dangerous Gusts"
        elif self.wind_gusts > 15:
            return "Strong Gusts"
        elif self.wind_gusts > 10:
            return "Moderate Gusts"
        else:
            return "Light Gusts"
    
    def classify_beach_humidity(self):
        if self.humidity > 80:
            return "Very Humid"
        elif self.humidity > 65:
            return "Humid"
        elif self.humidity > 45:
            return "Comfortable"
        else:
            return "Dry"
    
    def classify_beach_uv_index(self):
        if self.uv_index >= 11:
            return "Extreme (Dangerous)"
        elif self.uv_index >= 8:
            return "Very High (Protection needed)"
        elif self.uv_index >= 6:
            return "High (Protection recommended)"
        elif self.uv_index >= 3:
            return "Moderate (Some protection)"
        elif self.uv_index >= 1:
            return "Low (Minimal risk)"
        else:
            return "None"
    
    def classify_beach_cloud_coverage(self):
        if self.cloud_cover >= 0 and self.cloud_cover < 20:
            return "Mostly Clear"
        elif self.cloud_cover >= 20 and self.cloud_cover < 50:
            return "Partly Cloudy"
        elif self.cloud_cover >= 50 and self.cloud_cover < 80:
            return "Cloudy"
        else:
            return "Overcast"
    def classify_beach_weather_code(self):
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
    def classify_beach_conditions(self):
        temp_class = self.classify_beach_temp()
        rain_class = self.classify_beach_rain()
        precipitation_chance_class = self.classify_beach_precipitation_chance()
        wind_class = self.classify_beach_wind()
        wind_gusts_class = self.classify_beach_wind_gusts()
        cloud_class = self.classify_beach_cloud_coverage()
        weather_code_class = self.classify_beach_weather_code()
        humidity_class = self.classify_beach_humidity()
        uv_class = self.classify_beach_uv_index()

        return {
            "Temperature": temp_class,
            "Rain": rain_class,
            "Rain Chance": precipitation_chance_class,
            "Wind": wind_class,
            "Wind Gusts": wind_gusts_class,
            "Cloud Cover": cloud_class,
            "Weather Code": weather_code_class,
            "Humidity": humidity_class,
            "UV Index": uv_class
        }
    def classify_beach_overall(self):
        conditions = self.classify_beach_conditions()
        if (conditions["Temperature"] == "Hot" and 
            conditions["Rain"] == "Dry" and 
            conditions["Rain Chance"] in ["Very Low Chance", "Low Chance"] and
            conditions["Wind"] == "Nice Breeze" and
            conditions["Wind Gusts"] in ["Light Gusts", "Moderate Gusts"] and
            conditions["Humidity"] in ["Comfortable", "Dry"] and
            conditions["UV Index"] not in ["Extreme (Dangerous)"]):
            return "Ideal Beach Conditions"
        elif (conditions["Temperature"] in ["Good", "Acceptable"] and 
              conditions["Rain"] != "Heavy Rain" and
              conditions["Rain Chance"] not in ["Very High Chance"] and
              conditions["Wind Gusts"] != "Dangerous Gusts" and
              conditions["UV Index"] != "Extreme (Dangerous)"):
            return "Good Beach Conditions"
        elif (conditions["Temperature"] in ["Cold", "Very Cold"] or 
              conditions["Rain"] in ["Heavy Rain"] or
              conditions["Rain Chance"] == "Very High Chance" or
              conditions["Wind Gusts"] == "Dangerous Gusts" or
              conditions["UV Index"] == "Extreme (Dangerous)"):
            return "Not Suitable for Beach"
        else:
            return "Acceptable for Beach"
    def overall_recommendation(self):
        overall_classification = self.classify_beach_overall()
        if overall_classification == "Ideal Beach Conditions":
            return "Perfect day for the beach! Enjoy the sun and bloom out!"
        elif overall_classification == "Good Beach Conditions":
            return "Good conditions for a beach visit. Have fun!"
        elif overall_classification == "Acceptable for Beach":
            return "Conditions are okay, but be prepared for cooler weather."
        else:
            return "Not suitable for beach activities. Consider other plans."

# Create an instance of the BeachClassModel with current weather data
current_beach_model = BeachClassModel(
    temperature=current_temperature_2m,
    precipitation=current_precipitation,
    rain=current_rain,
    wind_speed=current_wind_speed_10m * 3.6,  # Convert m/s to km/h
    wind_gusts=current_wind_gusts_10m * 3.6,  # Convert m/s to km/h
    is_day=current_is_day,
    cloud_cover=current_cloud_cover,
    weather_code=current_weathercode,
    humidity=current_relative_humidity_2m,
    uv_index=current_uv_index
)

# Classify current beach conditions
current_beach_conditions = current_beach_model.classify_beach_conditions()
current_overall_classification = current_beach_model.classify_beach_overall()
current_recommendation = current_beach_model.overall_recommendation()

# Print current beach conditions analysis
print(f"\n" + "="*60)
print(f"CURRENT BEACH CONDITIONS ANALYSIS")
print(f"="*60)
for condition, classification in current_beach_conditions.items():
    print(f"  {condition}: {classification}")

print(f"\nCurrent Overall Classification: {current_overall_classification}")
print(f"Current Recommendation: {current_recommendation}")

# Create an instance of the BeachClassModel with hourly weather data (using first hourly data point)
beach_model = BeachClassModel(
    temperature=hourly_temperature_2m[0],  # First hour temperature
    precipitation=hourly_precipitation_probability[0],  # First hour precipitation probability
    rain=hourly_rain[0],  # First hour rain
    wind_speed=hourly_wind_speed_10m[0] * 3.6,  # Convert m/s to km/h for consistency
    wind_gusts=hourly_wind_gusts_10m[0] * 3.6,  # Convert m/s to km/h for consistency
    is_day=1,  # Assuming daytime (you can modify this based on time)
    cloud_cover=hourly_cloud_cover[0],  # First hour cloud cover
    weather_code=hourly_weather_code[0],  # First hour weather code
    humidity=hourly_relative_humidity_2m[0],  # First hour humidity
    uv_index=hourly_uv_index[0]  # First hour UV index
)

# Classify the beach conditions
beach_conditions = beach_model.classify_beach_conditions()
overall_classification = beach_model.classify_beach_overall()
recommendation = beach_model.overall_recommendation()

# Print the classified beach conditions for the first hour
print("\nClassified Beach Conditions (First Hour):")
for condition, classification in beach_conditions.items():
    print(f"  {condition}: {classification}")

print(f"\nOverall Classification: {overall_classification}")
print(f"Recommendation: {recommendation}")

# Optional: Show beach conditions for the next few hours (7AM to 8PM only)
print("\n" + "="*60)
print("HOURLY BEACH FORECAST (7AM - 8PM)")
print("="*60)

# Add reasoning based on current conditions
current_hour = current_time.hour
if current_hour < 7:
    print(f"⏰ It's currently {current_hour}:00 - Beach forecasts start from 7 AM")
elif current_hour > 20:
    print(f"🌙 It's currently {current_hour}:00 - Beach hours (7 AM - 8 PM) are over for today")
    print("Consider checking tomorrow's forecast!")
else:
    if current_overall_classification == "Ideal Beach Conditions":
        print("🏖️ Current conditions are IDEAL! Great time to be at the beach!")
    elif current_overall_classification == "Good Beach Conditions":
        print("☀️ Current conditions are GOOD for beach activities!")
    elif current_overall_classification == "Acceptable for Beach":
        print("⛅ Current conditions are ACCEPTABLE - be prepared for changing weather")
    else:
        print("⚠️ Current conditions are NOT SUITABLE for beach activities")

for i in range(len(hourly_temperature_2m)):
    # Get the date and time for this hour
    current_datetime = hourly_dataframe['date'].iloc[i]
    hour = current_datetime.hour
    
    # Only show data between 7 AM and 8 PM (20:00)
    if 7 <= hour <= 20:
        hour_model = BeachClassModel(
            temperature=hourly_temperature_2m[i],
            precipitation=hourly_precipitation_probability[i],
            rain=hourly_rain[i],
            wind_speed=hourly_wind_speed_10m[i] * 3.6,  # Convert m/s to km/h for consistency
            wind_gusts=hourly_wind_gusts_10m[i] * 3.6,  # Convert m/s to km/h for consistency
            is_day=1,  # You can modify this based on actual time
            cloud_cover=hourly_cloud_cover[i],
            weather_code=hourly_weather_code[i],
            humidity=hourly_relative_humidity_2m[i],
            uv_index=hourly_uv_index[i]
        )
        
        hour_conditions = hour_model.classify_beach_conditions()
        hour_overall = hour_model.classify_beach_overall()
        
        # Add trend indicators compared to current conditions
        temp_trend = ""
        temp_diff = hourly_temperature_2m[i] - current_temperature_2m
        
        # Consider time of day for more accurate trends
        if hour > 16:  # After 4 PM, temperatures typically cool down
            if temp_diff > 1:
                temp_trend = f"🔥 (+{temp_diff:.1f}°C Warmer than expected)"
            elif temp_diff < -1:
                temp_trend = f"❄️ ({temp_diff:.1f}°C Evening cooling)"
            else:
                temp_trend = f"➡️ (Normal evening temp)"
        elif hour < 10:  # Before 10 AM, temperatures typically warming up
            if temp_diff > 1:
                temp_trend = f"🔥 (+{temp_diff:.1f}°C Morning warming)"
            elif temp_diff < -1:
                temp_trend = f"❄️ ({temp_diff:.1f}°C Cooler than expected)"
            else:
                temp_trend = f"➡️ (Normal morning temp)"
        else:  # Midday hours
            if temp_diff > 2:
                temp_trend = f"🔥 (+{temp_diff:.1f}°C Getting warmer)"
            elif temp_diff < -2:
                temp_trend = f"❄️ ({temp_diff:.1f}°C Getting cooler)"
            else:
                temp_trend = f"➡️ (Steady temp)"
            
        # Overall trend
        overall_trend = ""
        if hour_overall == "Ideal Beach Conditions":
            overall_trend = "🌟"
        elif hour_overall == "Good Beach Conditions":
            overall_trend = "✅"
        elif hour_overall == "Acceptable for Beach":
            overall_trend = "⚠️"
        else:
            overall_trend = "❌"
        
        print(f"\n{current_datetime.strftime('%Y-%m-%d %H:%M')} {overall_trend}:")
        print(f"  Temperature: {hourly_temperature_2m[i]:.1f}°C ({hour_conditions['Temperature']}) {temp_trend}")
        print(f"  Rain: {hourly_rain[i]:.1f}mm ({hour_conditions['Rain']})")
        print(f"  Rain Chance: {hourly_precipitation_probability[i]:.0f}% ({hour_conditions['Rain Chance']})")
        print(f"  Wind: {hourly_wind_speed_10m[i] * 3.6:.1f}km/h ({hour_conditions['Wind']})")
        print(f"  Wind Gusts: {hourly_wind_gusts_10m[i] * 3.6:.1f}km/h ({hour_conditions['Wind Gusts']})")
        print(f"  Humidity: {hourly_relative_humidity_2m[i]:.0f}% ({hour_conditions['Humidity']})")
        print(f"  UV Index: {hourly_uv_index[i]:.1f} ({hour_conditions['UV Index']})")
        print(f"  Cloud Cover: {hourly_cloud_cover[i]:.0f}% ({hour_conditions['Cloud Cover']})")
        print(f"  Weather: {hour_conditions['Weather Code']}")
        print(f"  Overall: {hour_overall}")