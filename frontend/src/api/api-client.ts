import axios from "axios";
import supabase from "../supabase";

const API_BASE =
  import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VITE_API_BASE ?? "/api";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Request interceptor to add Authorization Bearer token
// This is ran on every axios request
api.interceptors.request.use(
  async (config) => {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
