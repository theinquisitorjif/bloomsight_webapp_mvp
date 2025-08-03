#This model pulls in data from earth data and weatehr data APIs to create a beach class model
import openmeteo_requests
import pandas as pd
import requests_cache
from retry_requests import retry


#Pull in data from Open-Meteo API
# Setup the Open-Meteo API client with cache and retry on error
cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
openmeteo = openmeteo_requests.Client(session=retry_session)
# Make sure all required weather variables are listed here
url = "https://api.open-meteo.com/v1/forecast"
params = {
    "latitude": 29.651634, # Will need to add place holders for this when we pull a location via button or search
    "longitude": -82.324826, #Samething here. Need to make sure that whatever we use gives us the ability to extract out the coordinates
    "current": ["temperature_2m", 
                "precipitation", 
                "rain", 
                "wind_speed_10m", 
                "is_day", 
                "cloud_cover", 
                "weathercode"],
}
responses = openmeteo.weather_api(url, params=params)

responses = responses[0]
print(f"Coordinates: {responses.Latitude()}°N {responses.Longitude()}°E")
print(f"Elevation: {responses.Elevation()} m asl")
print(f"Timezone difference to GMT+0: {responses.UtcOffsetSeconds()}s")
# Process current data. The order of variables needs to be the same as requested.
current = responses.Current()
current_temperature_2m = current.Variables(0).Value()
current_precipitation = current.Variables(1).Value()
current_rain = current.Variables(2).Value()
current_wind_speed_10m = current.Variables(3).Value()
current_is_day = current.Variables(4).Value()
current_cloud_cover = current.Variables(5).Value()
current_weathercode = current.Variables(6).Value()

#Print current weather data
print(f"Current Temperature: {current_temperature_2m}°C")
print(f"Current Precipitation: {current_precipitation}mm")
print(f"Current Rain: {current_rain}mm")
print(f"Current Wind Speed: {current_wind_speed_10m}m/s")
print(f"Is it Daytime? {'Yes' if current_is_day else 'No'}")
print(f"Current Cloud Cover: {current_cloud_cover}%")
print(f"Current Weather Code: {current_weathercode}")

#Create beach class model 

class BeachClassModel: 
    def __init__(self, temperature, precipitation, rain, wind_speed, is_day, cloud_cover, weather_code):
        self.temperature = temperature
        self.precipitation = precipitation
        self.rain = rain
        self.wind_speed = wind_speed
        self.is_day = is_day
        self.cloud_cover = cloud_cover
        self.weather_code = weather_code

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
        if self.rain > 1:
            return "Drizzle"
        elif self.rain > 5:
            return "Heavy Rain"
        else:
            return "Dry"
    def classify_beach_wind(self):
        if self.wind_speed > 2:
            return "Nice Breeze"
        elif self.wind_speed > 9:
            return "Windy"
        elif self.wind_speed > 13:
            return "Very Strong Winds"
        else:
            return "Calm"
    def classify_beach_cloud_coverage(self):
        if self.cloud_cover > 0 and self.cloud_cover < 20:
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
        wind_class = self.classify_beach_wind()
        cloud_class = self.classify_beach_cloud_coverage()
        weather_code_class = self.classify_beach_weather_code()

        return {
            "Temperature": temp_class,
            "Rain": rain_class,
            "Wind": wind_class,
            "Cloud Cover": cloud_class,
            "Weather Code": weather_code_class
        }
    #Classify beach overall base don conditions
    def classify_beach_overall(self):
        conditions = self.classify_beach_conditions()
        if conditions["Temperature"] == "Hot" and conditions["Rain"] == "Dry" and conditions["Wind"] == "Nice Breeze":
            return "Ideal Beach Conditions"
        elif conditions["Temperature"] in ["Good", "Acceptable"] and conditions["Rain"] != "Heavy Rain":
            return "Good Beach Conditions"
        elif conditions["Temperature"] in ["Cold", "Very Cold"] and conditions["Rain"] != "Dry":
            return "Acceptable for Beach"
        elif conditions["Temperature"] in ["Cold", "Very Cold"] or conditions["Rain"] == "Heavy Rain":
            return "Not Suitable for Beach"
        else:
            return "Not Suitable for Beach"
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
beach_model = BeachClassModel(
    temperature=current_temperature_2m,
    precipitation=current_precipitation,
    rain=current_rain,
    wind_speed=current_wind_speed_10m,
    is_day=current_is_day,
    cloud_cover=current_cloud_cover,
    weather_code=current_weathercode
)

# Classify the beach conditions
beach_conditions = beach_model.classify_beach_conditions()

# Print the classified beach conditions
print("Classified Beach Conditions:")
for condition, classification in beach_conditions.items():
    print(f"  {condition}: {classification}")
