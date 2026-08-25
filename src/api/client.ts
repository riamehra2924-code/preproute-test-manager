import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT to every request except /auth/login
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && !config.url?.includes("/auth/login")) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Central 401 handling: clear auth + bounce to login
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

/** Extracts a human-readable error message from an axios error. */
export function getErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; error?: string } | undefined;
    return data?.message || data?.error || err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
