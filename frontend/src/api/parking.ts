import type { ParkingSpotsAPIResponse } from "@/types/parking-spots";
import { useQuery } from "@tanstack/react-query";
import { api } from "./api-client";

export function useGetParkingSpotsByBeachID(id: number) {
  return useQuery<ParkingSpotsAPIResponse>({
    queryKey: ["parking-spots"],
    queryFn: async () => {
      const { data } = await api.get(`/beaches/${id}/parking-spots`);
      return data;
    },
  });
}
