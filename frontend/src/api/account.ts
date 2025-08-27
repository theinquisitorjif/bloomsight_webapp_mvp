import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "./api-client";
import supabase from "@/supabase";
import { type CommentAPIResponse } from "@/types/comment";

export function useDeleteUser() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.delete("/account");
      return data;
    },
    onSuccess: async (data) => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error(error);
        return;
      }
      return data;
    },
    onError: (error) => {
      console.error(error);
    },
  });
}

export function useUpdateUser() {}

export function useGetAccountComments() {
  return useQuery<CommentAPIResponse["comments"]>({
    queryKey: ["account-comments"],
    queryFn: async () => {
      const { data } = await api.get("/account/comments");
      return data.comments;
    },
  });
}
