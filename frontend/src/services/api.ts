//axios = library to call HTTP api's
import axios from "axios";

// Determine the base URL:
// Use VITE_API_URL if defined (prod), otherwise fallback to local (dev)
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:4000";

const API = axios.create({
  baseURL: BASE_URL,
});

//interceptor= run before every api call
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token && req.headers) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;
