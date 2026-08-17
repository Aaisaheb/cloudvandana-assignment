import axios from "axios";

const defaultApiUrl =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost" ? "http://localhost:5000" : window.location.origin);

const api = axios.create({
  baseURL: defaultApiUrl,
  withCredentials: true // sends the session cookie set during OAuth login
});

export default api;
