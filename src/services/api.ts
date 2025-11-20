import axios from "axios";
import { storage } from "../utils/storage";

// Base API configuration
// ⚠️ QUAN TRỌNG: Để chạy app trên điện thoại, cần thay IP bên dưới bằng IP LAN của máy tính bạn
// Cách tìm IP:
// - Windows: Mở CMD chạy "ipconfig", tìm "IPv4 Address" của adapter đang kết nối internet
// - macOS: Mở Terminal chạy "ifconfig | grep inet", tìm địa chỉ IP private (192.168.x.x hoặc 10.x.x.x)
// - Linux: Mở Terminal chạy "ip addr show", tìm inet addr trong eth0/wlan0
// Ví dụ: "http://192.168.1.10:8080/api"
const API_BASE_URL =
  __DEV__
    ? "http://192.168.1.15:8080/api" // ⚠️ THAY IP NÀY BẰNG IP THỰC CỦA MÁY TÍNH BẠN
    : "https://baitapnhom-laptrinhchothietbididong-omtc.onrender.com/api"; // URL production
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
