import axios from "axios";
import { storage } from "../utils/storage";

// Base API configuration
// Server Render.com
const API_BASE_URL = 
"https://baitapnhom-laptrinhchothietbididong-omtc.onrender.com/api";
// "http://localhost:8080/api";

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
    // Xử lý lỗi network
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('🌐 Network Error:', {
        message: error.message,
        baseURL: error.config?.baseURL,
        url: error.config?.url,
      });
      // Tạo error message rõ ràng hơn
      const networkError = new Error('Không thể kết nối đến server. Vui lòng:\n• Kiểm tra kết nối internet\n• Đảm bảo server đang chạy\n• Kiểm tra URL API trong cấu hình');
      (networkError as any).isNetworkError = true;
      (networkError as any).originalError = error;
      return Promise.reject(networkError);
    }

    // Xử lý timeout
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      const timeoutError = new Error('Kết nối quá lâu. Server có thể đang tạm thời không phản hồi. Vui lòng thử lại sau.');
      (timeoutError as any).isTimeoutError = true;
      return Promise.reject(timeoutError);
    }

    if (error.response?.status === 401) {
      // Token hết hạn, xóa token và redirect về login
      await storage.removeItem("authToken");
      await storage.removeItem("user");
    }
    
    return Promise.reject(error);
  }
);

export default api;
