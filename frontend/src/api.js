import axios from "axios"
import {jwtDecode} from "jwt-decode"

export const BASE_URL = "http://127.0.0.1:8001"


const api = axios.create({
  baseURL: "http://localhost:8001",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
