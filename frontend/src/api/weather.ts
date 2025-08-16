import { type WeatherForecastAPIResponse } from "@/types/weather-forecast";
import { useQuery } from "@tanstack/react-query";
import { api } from "./api-client";

export function useGetWeatherForecastByBeachID(id: number) {
  return useQuery<WeatherForecastAPIResponse[]>({
    queryKey: ["weather-forecast"],
    queryFn: async () => {
      const { data } = await api.get(`/beaches/${id}/weather-forecast`);
      return data;
    },
  });
}
