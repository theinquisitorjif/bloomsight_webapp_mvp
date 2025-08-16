import {
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  CloudSun,
  Cloudy,
  Sun,
} from "lucide-react";

/** Weather codes from https://open-meteo.com/en/docs#weather_variable_documentation*/
export const WeatherCode = {
  0: {
    name: "Clear Skies",
    icon: Sun,
  },
  1: {
    name: "Mainly Clear Skies",
    icon: Sun,
  },
  2: {
    name: "Partly Cloudy",
    icon: CloudSun,
  },
  3: {
    name: "Overcast",
    icon: Cloudy,
  },
  45: {
    name: "Foggy",
    icon: CloudFog,
  },
  48: {
    name: "Rime Fog",
    icon: CloudFog,
  },
  51: {
    name: "Light Drizzle",
    icon: CloudDrizzle,
  },
  53: {
    name: "Moderate Drizzle",
    icon: CloudDrizzle,
  },
  55: {
    name: "Heavy Drizzle",
    icon: CloudDrizzle,
  },
  56: {
    name: "Freezing Drizzle",
    icon: CloudDrizzle,
  },
  57: {
    name: "Heavy Freezing Drizzle",
    icon: CloudDrizzle,
  },
  61: {
    name: "Light Rain",
    icon: CloudRain,
  },
  63: {
    name: "Moderate Rain",
    icon: CloudRain,
  },
  65: {
    name: "Heavy Rain",
    icon: CloudRain,
  },
  66: {
    name: "Light Freezing Rain",
    icon: CloudRain,
  },
  67: {
    name: "Heavy Freezing Rain",
    icon: CloudRain,
  },
  71: {
    name: "Light Snow",
    icon: CloudSnow,
  },
  73: {
    name: "Moderate Snow",
    icon: CloudSnow,
  },
  75: {
    name: "Heavy Snow",
    icon: CloudSnow,
  },
  77: {
    name: "Snow Grains",
    icon: CloudSnow,
  },
  80: {
    name: "Light Rain Showers",
    icon: CloudRain,
  },
  81: {
    name: "Moderate Rain Showers",
    icon: CloudRain,
  },
  82: {
    name: "Violent Rain Showers",
    icon: CloudRainWind,
  },
  85: {
    name: "Light Snow Showers",
    icon: CloudSnow,
  },
  86: {
    name: "Moderate Snow Showers",
    icon: CloudSnow,
  },
  95: {
    name: "Thunderstorm",
    icon: CloudLightning,
  },
  96: {
    name: "Thunderstorm with light rain",
    icon: CloudRainWind,
  },
  99: {
    name: "Thunderstorm with heavy rain",
    icon: CloudRainWind,
  },
};
