import type { ParkingSpotsAPIResponse } from "@/types/parking-spots";
import { useQuery } from "@tanstack/react-query";
import { api } from "./api-client";
import type { TidePredictionAPIResponse } from "@/types/tide-prediction";
import type { WeatherForecastAPIResponse } from "@/types/weather-forecast";
import type {
  RedtideRiskAPIResponse,
  RiptideRiskAPIResponse,
} from "@/types/risk-scores";

export function useGetParkingSpotsByBeachID(id: number) {
  return useQuery<ParkingSpotsAPIResponse>({
    queryKey: ["parking-spots"],
    queryFn: async () => {
      const { data } = await api.get(`/beaches/${id}/parking-spots`);
      return data;
    },
  });
}

export function useGetTidePredictionByBeachID(id: number) {
  return useQuery<TidePredictionAPIResponse>({
    queryKey: ["tide-prediction"],
    queryFn: async () => {
      const { data } = await api.get(`/beaches/${id}/tide-prediction`);
      return data;
    },
  });
}

export function useGetWeatherForecastByBeachID(id: number) {
  return useQuery<WeatherForecastAPIResponse[]>({
    queryKey: ["weather-forecast"],
    queryFn: async () => {
      const { data } = await api.get(`/beaches/${id}/weather-forecast`);
      return data;
    },
  });
}

export function useGetRiptideRiskByBeachID(id: number) {
  return useQuery<RiptideRiskAPIResponse>({
    queryKey: ["riptide-risk"],
    queryFn: async () => {
      const { data } = await api.get(`/beaches/${id}/riptide-risk`);
      return data;
    },
  });
}

export function useGetRedtideRiskByBeachID(id: number) {
  return useQuery<RedtideRiskAPIResponse>({
    queryKey: ["redtide-risk"],
    queryFn: async () => {
      const { data } = await api.get(`/beaches/${id}/water-quality`);
      return data;
    },
  });
}
