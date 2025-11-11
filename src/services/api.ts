import axios from "axios";
import { storage } from "../utils/storage";

// Base API configuration
const API_BASE_URL =
  "https://baitapnhom-laptrinhchothietbididong-omtc.onrender.com/api"; // Thay thế bằng URL Railway thực tế của bạn

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Tăng timeout lên 30s vì Render.com free tier có thể mất thời gian để wake up
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor để thêm token
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn, xóa token và redirect về login
      await storage.removeItem("authToken");
      await storage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export default api;
