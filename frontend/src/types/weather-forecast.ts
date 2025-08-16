export interface WeatherForecastAPIResponse {
  air_quality: number;
  gust_speed: number;
  humidity: number;
  precipitation: number;
  sunrise: string; // ISO String
  sunset: string; // ISO String
  temp: number;
  temp_max: number;
  temp_min: number;
  uv_index: number;
  weather_code: number;
  wind_dir: number;
  wind_speed: number;
  recommendation_score: number; // 0-5
}
