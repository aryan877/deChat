import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { useNotificationStore } from "@/app/store/notificationStore";
import { useClusterStore } from "@/app/store/clusterStore";
import { ErrorResponse } from "@/app/types";
import { getAccessToken } from "@privy-io/react-auth";

type ErrorDetails = Record<string, unknown> | undefined;

const api = axios.create({
  baseURL: "/",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const selectedCluster = useClusterStore.getState().selectedCluster;
  config.headers["x-cluster"] = selectedCluster;
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: unknown) => {
    const axiosError = error as AxiosError<ErrorResponse>;
    const errorData = axiosError.response?.data;
    const originalRequest = axiosError.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle invalid auth token error - only retry once
    if (
      errorData?.error?.message === "invalid auth token" &&
      originalRequest &&
      !originalRequest._retry
    ) {
      try {
        originalRequest._retry = true; // Mark this request as retried
        // Try to get a fresh token
        const newToken = await getAccessToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          // Retry the original request with new token
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Error refreshing token:", refreshError);
      }
    }

    let errorMessage = "An unexpected error occurred";
    let details: ErrorDetails = undefined;

    if (errorData?.error) {
      errorMessage = errorData.error.message;
      details = errorData.error.details as ErrorDetails;
    } else if (axiosError.message) {
      errorMessage = axiosError.message;
    }

    const addNotification = useNotificationStore.getState().addNotification;
    addNotification("error", errorMessage, details);

    return Promise.reject(error);
  }
);

export default api;
