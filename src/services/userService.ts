import { User } from '../types';
import api from './api';

export const userService = {
  // Lấy tất cả users (admin)
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    if (response.data.code === 200) {
      return response.data.result;
    }
    throw new Error(response.data.message || 'Failed to get users');
  },

  // Lấy user theo ID
  getUser: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    if (response.data.code === 200) {
      return response.data.result;
    }
    throw new Error(response.data.message || 'Failed to get user');
  },

  // Lấy user theo username
  getUserByUsername: async (username: string): Promise<User> => {
    const response = await api.get(`/users/username/${username}`);
    if (response.data.code === 200) {
      return response.data.result;
    }
    throw new Error(response.data.message || 'Failed to get user');
  },

  // Lấy user theo email
  getUserByEmail: async (email: string): Promise<User> => {
    const response = await api.get(`/users/email/${email}`);
    if (response.data.code === 200) {
      return response.data.result;
    }
    throw new Error(response.data.message || 'Failed to get user');
  },

  // Tạo user mới
  createUser: async (userData: Omit<User, 'id'>): Promise<User> => {
    const response = await api.post('/users', userData);
    if (response.data.code === 200) {
      return response.data.result;
    }
    throw new Error(response.data.message || 'Failed to create user');
  },

  // Cập nhật user
  updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${id}`, userData);
    if (response.data.code === 200) {
      return response.data.result;
    }
    throw new Error(response.data.message || 'Failed to update user');
  },

  // Xóa user (admin)
  deleteUser: async (id: number): Promise<void> => {
    const response = await api.delete(`/users/${id}`);
    if (response.data.code !== 200) {
      throw new Error(response.data.message || 'Failed to delete user');
    }
  },

  // Kiểm tra username tồn tại
  checkUsername: async (username: string): Promise<boolean> => {
    const response = await api.get(`/users/check-username/${username}`);
    if (response.data.code === 200) {
      return response.data.result;
    }
    throw new Error(response.data.message || 'Failed to check username');
  },

  // Kiểm tra email tồn tại
  checkEmail: async (email: string): Promise<boolean> => {
    const response = await api.get(`/users/check-email/${email}`);
    if (response.data.code === 200) {
      return response.data.result;
    }
    throw new Error(response.data.message || 'Failed to check email');
  },
};