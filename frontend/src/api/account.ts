import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "./api-client";
import supabase from "@/supabase";
import { type CommentAPIResponse } from "@/types/comment";
import { toast } from "sonner";

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

export function useUpdateUser() {
  return useMutation({
    mutationFn: async (data: {
      username?: string;
      picture?: string | File;
    }) => {
      if (!data.username && !data.picture) {
        return;
      }

      if (data.picture instanceof File) {
        const formData = new FormData();
        formData.append("file", data.picture);

        // Get picture URL
        const { data: pictureData } = await api.post(
          "/account/picture",
          formData
        );
        data.picture = pictureData.url;
      }

      const { data: res } = await api.put("/account", data);
      return res;
    },
    onSuccess: (data) => {
      toast.success("Account updated successfully!");
      return data;
    },
    onError: (error) => {
      toast.error("Failed to update account!");
      console.error(error);
    },
  });
}

export function useGetAccountComments() {
  return useQuery<CommentAPIResponse["comments"]>({
    queryKey: ["comments"],
    queryFn: async () => {
      const { data } = await api.get("/account/comments");
      return data.comments;
    },
  });
}
