import api from './api';
import { storage } from '../utils/storage';
import { LoginRequest, LoginResponse, User } from '../types';

export const authService = {
  // Đăng nhập
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    console.log('Login request:', credentials);
    
    try {
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
    } catch (error: any) {
      console.log('Login API failed, trying mock login...');
      
      // Mock login cho demo - kiểm tra với dữ liệu user có sẵn
      const mockUsers = [
        { id: 1, username: 'admin', email: 'admin@movieticket.com', fullName: 'Admin System', role: 'ADMIN' },
        { id: 2, username: 'staff1', email: 'staff1@movieticket.com', fullName: 'Nguyễn Văn A', role: 'STAFF' },
        { id: 3, username: 'customer1', email: 'customer1@gmail.com', fullName: 'Trần Thị B', role: 'CUSTOMER' },
        { id: 4, username: 'customer2', email: 'customer2@gmail.com', fullName: 'Lê Văn C', role: 'CUSTOMER' }
      ];
      
      // Tìm user theo username hoặc email
      const user = mockUsers.find(u => 
        u.username === credentials.username || u.email === credentials.username
      );
      
      if (user && credentials.password === 'password') {
        const mockToken = `mock_token_${user.id}_${Date.now()}`;
        const result = {
          token: mockToken,
          user: user
        };
        
        // Lưu token và user vào storage
        await storage.setItem('authToken', result.token);
        await storage.setItem('user', JSON.stringify(result.user));
        
        console.log('Mock login successful:', result);
        return result;
      }
      
      throw new Error('Invalid credentials');
    }
  },

  // Đăng ký
  register: async (userData: Partial<User>): Promise<User> => {
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
    await api.put('/auth/change-password', {
      oldPassword,
      newPassword,
    });
  },
};
