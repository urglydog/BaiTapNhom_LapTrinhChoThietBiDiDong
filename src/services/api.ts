import axios from "axios";
import { storage } from "../utils/storage";

// Base API configuration
// Server Render.com
const API_BASE_URL = 
"https://baitapnhom-laptrinhchothietbididong-omtc.onrender.com/api";
// "http://192.168.1.190:8080/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 45000, // Tăng timeout lên 45s vì Render.com free tier có thể mất thời gian để wake up
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor để thêm token
api.interceptors.request.use(
    async (config) => {
        // Log request URL for debugging
        const fullUrl = `${config.baseURL}${config.url}`;
        console.log('📤 API Request:', config.method?.toUpperCase(), fullUrl);
        
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
      const fullUrl = error.config ? `${error.config.baseURL}${error.config.url}` : 'Unknown';
      console.error('🌐 Network Error:', {
        message: error.message,
        code: error.code,
        baseURL: error.config?.baseURL,
        url: error.config?.url,
        fullUrl: fullUrl,
      });
      
      // Kiểm tra xem có phải là lỗi CORS không
      let errorMessage = 'Không thể kết nối đến server.';
      
      // Render.com free tier có thể mất thời gian để wake up
      if (fullUrl.includes('onrender.com')) {
        errorMessage = 'Server đang khởi động. Vui lòng đợi vài giây rồi thử lại.\n\nNếu vẫn lỗi, có thể server đang tạm thời không khả dụng.';
      } else {
        errorMessage = `Không thể kết nối đến server.\nURL: ${fullUrl}\n\nVui lòng:\n• Kiểm tra kết nối internet\n• Đảm bảo server đang chạy\n• Kiểm tra URL API trong cấu hình`;
      }
      
      const networkError = new Error(errorMessage);
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

    // Xử lý lỗi CORS
    if (error.message?.includes('CORS') || error.code === 'ERR_CORS') {
      const corsError = new Error('Lỗi CORS: Server không cho phép truy cập từ ứng dụng này. Vui lòng liên hệ quản trị viên.');
      (corsError as any).isCorsError = true;
      return Promise.reject(corsError);
    }

    if (error.response?.status === 401) {
      // Token hết hạn, xóa token và redirect về login
      await storage.removeItem("authToken");
      await storage.removeItem("user");
    }
    
    // Xử lý lỗi từ server response
    if (error.response?.data) {
      const serverError = new Error(error.response.data.message || 'Đã xảy ra lỗi từ server');
      (serverError as any).statusCode = error.response.status;
      (serverError as any).responseData = error.response.data;
      return Promise.reject(serverError);
    }
    
    return Promise.reject(error);
  }
);

export default api;
