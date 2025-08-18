import type { ParkingSpotsAPIResponse } from "@/types/parking-spots";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api-client";
import type { TidePredictionAPIResponse } from "@/types/tide-prediction";
import type { WeatherForecastAPIResponse } from "@/types/weather-forecast";
import type {
  RedtideRiskAPIResponse,
  RiptideRiskAPIResponse,
} from "@/types/risk-scores";
import {
  type BeachReportsAPIResponse,
  type ReportAPIResponse,
} from "@/types/report";
import {
  type ReviewAPIResponse,
  type CommentAPIResponse,
} from "@/types/comment";
import {
  type BeachAPIResponse,
  type BeachPicturesAPIResponse,
} from "@/types/beach";

export function useGetBeachByBeachID(id: number) {
  return useQuery<BeachAPIResponse>({
    queryKey: ["beach", id],
    queryFn: async () => {
      const { data } = await api.get(`/beaches/${id}`);
      return data;
    },
  });
}

export function useGetParkingSpotsByBeachID(id: number) {
  return useQuery<ParkingSpotsAPIResponse>({
    queryKey: ["parking-spots", id],
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

export function useGetCommentReports() {
  return useQuery<ReportAPIResponse[]>({
    queryKey: ["comment-reports"],
    queryFn: async () => {
      const { data } = await api.get(`/beaches/reports`);
      return data;
    },
  });
}

export function useGetBeachReportsByBeachID(id: number) {
  return useQuery<BeachReportsAPIResponse[]>({
    queryKey: ["beach-reports", id],
    queryFn: async () => {
      const { data } = await api.get(`/beaches/${id}/reports`);
      return data;
    },
  });
}

export function useUploadCommentByBeachID(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (comment: {
      rating: number;
      conditions: string;
      reports: number[];
      content: string;
      timestamp: string; // ISO String
    }) => {
      const { data } = await api.post(`/beaches/${id}/comments`, comment);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["beach-reports", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["pictures", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["reviews", id],
      });
      return data;
    },
    onError: (error) => {
      console.error(error);
    },
  });
}

export function useUploadPictureByBeachID(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      comment_id,
    }: {
      file: File;
      comment_id: number;
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("comment_id", comment_id.toString());
      const { data } = await api.post(`/beaches/${id}/pictures`, formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pictures", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["comments", id],
      });
    },
    onError: (error) => {
      console.error(error);
    },
  });
}

export function useGetPicturesByBeachID(id: number) {
  return useQuery<BeachPicturesAPIResponse[]>({
    queryKey: ["pictures", id],
    queryFn: async () => {
      const { data } = await api.get(`/beaches/${id}/pictures`);
      return data;
    },
  });
}

export function useGetCommentsByBeachID(id: number, page: number = 1) {
  return useQuery<CommentAPIResponse>({
    queryKey: ["comments", id],
    queryFn: async () => {
      const { data } = await api.get(`/beaches/${id}/comments?page=${page}`);
      return data;
    },
  });
}

export function useGetReviewsByBeachID(id: number) {
  return useQuery<ReviewAPIResponse>({
    queryKey: ["reviews", id],
    queryFn: async () => {
      const { data } = await api.get(`/beaches/${id}/reviews`);
      return data;
    },
  });
}

export function useDeleteCommentByBeachID(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (comment_id: number) => {
      const { data } = await api.delete(
        `/beaches/${id}/comments/${comment_id}`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["beach-reports", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["pictures", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["reviews", id],
      });
    },
    onError: (error) => {
      console.error(error);
    },
  });
}
