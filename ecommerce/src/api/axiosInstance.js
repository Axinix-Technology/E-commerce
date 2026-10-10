import axios from "axios";

/**
 * Pre-configured Axios Instance for Centralized Platform
 * Automatically injects JWT Bearer token and handles 401 session expirations.
 */
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) return "/api";
  const trimmed = envUrl.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach JWT Access Token & Distributed Correlation Request ID
axiosInstance.interceptors.request.use(
  (config) => {
    // Inject unique Request Correlation ID if not present
    if (!config.headers["X-Request-ID"]) {
      const generatedId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      config.headers["X-Request-ID"] = generatedId;
    }

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = token.startsWith('Token ') || token.startsWith('Bearer ') 
        ? token 
        : `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Authentication Expiry
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired credentials
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login if not already on login page
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
