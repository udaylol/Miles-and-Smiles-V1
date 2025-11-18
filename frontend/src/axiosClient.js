// src/axiosClient.js
import axios from "axios";

const base = import.meta.env.VITE_BACKEND_SERVER || "/api";

const axiosClient = axios.create({
  baseURL: base, // dynamic for local AND docker/ngrok
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

// Attach token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ Axios error:", error);
    return Promise.reject(error);
  }
);

export default axiosClient;
