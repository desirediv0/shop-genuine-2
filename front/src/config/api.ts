// API base URL configuration
export const API_URL =
  import.meta.env.MODE === "production"
    ? "https://api.shopgenuine.online/api"
    : "http://localhost:4004/api";
