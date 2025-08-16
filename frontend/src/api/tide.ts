import type { TidePredictionAPIResponse } from "@/types/tide-prediction";
import { useQuery } from "@tanstack/react-query";
import { api } from "./api-client";

export function useGetTidePredictionByBeachID(id: number) {
  return useQuery<TidePredictionAPIResponse>({
    queryKey: ["tide-prediction"],
    queryFn: async () => {
      const { data } = await api.get(`/beaches/${id}/tide-prediction`);
      return data;
    },
  });
}
