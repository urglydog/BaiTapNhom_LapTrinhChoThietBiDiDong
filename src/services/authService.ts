import { LoginRequest, LoginResponse, RegisterRequest, SendOtpRequest, SendOtpResponse, User, VerifyOtpRequest, VerifyOtpResponse } from '../types';
import { storage } from '../utils/storage';
import api from './api';

export const authService = {
  // Đăng nhập
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    console.log('Login request:', credentials);
    
    const response = await api.post('/auth/login', credentials);
    console.log('Login response:', response.data);
    
    // Server trả về format: { code, message, result }
    if (response.data.code === 200) {
      const result = {
        token: response.data.result.token,
        user: response.data.result.user
      };
      
      // Lưu token và user vào storage
      await storage.setItem('authToken', result.token);
      await storage.setItem('user', JSON.stringify(result.user));
      
      return result;
    }
    throw new Error(response.data.message || 'Login failed');
  },

  // Đăng ký
  register: async (userData: RegisterRequest): Promise<User> => {
    const response = await api.post('/auth/register', userData);
    if (response.data.code === 200) {
      return response.data.result;
    }
    throw new Error(response.data.message || 'Registration failed');
  },

  // Đăng xuất
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    await storage.removeItem('authToken');
    await storage.removeItem('user');
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    if (response.data.code === 200) {
      return response.data.result;
    }
    throw new Error(response.data.message || 'Failed to get user info');
  },

  // Đổi mật khẩu
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    const response = await api.put('/auth/change-password', {
      oldPassword,
      newPassword,
    });
    if (response.data.code !== 200) {
      throw new Error(response.data.message || 'Failed to change password');
    }
  },

  // Đặt lại mật khẩu bằng email (sau khi verify OTP)
  resetPasswordByEmail: async (email: string, newPassword: string): Promise<void> => {
    await api.post('/auth/reset-password-email', {
      email,
      newPassword,
    });
  },

  // Gửi OTP
  sendOtp: async (request: SendOtpRequest): Promise<SendOtpResponse> => {
    // Backend expect query param, not body
    const response = await api.post('/auth/send-otp', null, {
      params: { email: request.email, type: request.type || 'REGISTER' }
    });
    if (response.data.code === 200) {
      return {
        success: true,
        message: response.data.message || 'OTP sent successfully',
        expiresIn: 300 // 5 phút
      };
    }
    throw new Error(response.data.message || 'Failed to send OTP');
  },

  // Gửi OTP cho quên mật khẩu
  sendOtpForReset: async (email: string): Promise<SendOtpResponse> => {
    const response = await api.post('/auth/send-otp-reset', null, {
      params: { email }
    });
    if (response.data.code === 200) {
      return {
        success: true,
        message: response.data.message || 'OTP sent successfully',
        expiresIn: 300 // 5 phút
      };
    }
    throw new Error(response.data.message || 'Failed to send OTP');
  },

  // Gửi OTP cho đăng ký
  sendOtpForRegister: async (email: string): Promise<SendOtpResponse> => {
    const response = await api.post('/auth/send-otp-register', null, {
      params: { email }
    });
    if (response.data.code === 200) {
      return {
        success: true,
        message: response.data.message || 'OTP sent successfully',
        expiresIn: 300 // 5 phút
      };
    }
    throw new Error(response.data.message || 'Failed to send OTP');
  },

  // Xác thực OTP
  verifyOtp: async (request: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    // Backend expect query params, not body
    const response = await api.post('/auth/verify-otp', null, {
      params: { email: request.email, otp: request.otp }
    });
    if (response.data.code === 200) {
      return {
        success: true,
        message: response.data.message || 'OTP verified successfully'
      };
    }
    throw new Error(response.data.message || 'OTP verification failed');
  },

  // Login với OTP (sau khi verify)
  loginWithOtp: async (token: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login-otp', { token });
    if (response.data.code === 200) {
      const result = response.data.result;
      
      // Lưu token và user vào storage
      await storage.setItem('authToken', result.token);
      await storage.setItem('user', JSON.stringify(result.user));
      
      return result;
    }
    throw new Error(response.data.message || 'Login with OTP failed');
  },
};