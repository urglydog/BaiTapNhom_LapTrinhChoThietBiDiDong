import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Mock storage cho server-side rendering
const mockStorage = {
  data: new Map<string, string>(),
  getItem: (key: string) => mockStorage.data.get(key) || null,
  setItem: (key: string, value: string) => mockStorage.data.set(key, value),
  removeItem: (key: string) => mockStorage.data.delete(key),
  clear: () => mockStorage.data.clear()
};

// Storage adapter để xử lý cả mobile và web
export const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      // Kiểm tra xem localStorage có tồn tại không (tránh lỗi SSR)
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
      // Fallback to mock storage for SSR
      return mockStorage.getItem(key);
    }
    return await AsyncStorage.getItem(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      // Kiểm tra xem localStorage có tồn tại không (tránh lỗi SSR)
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
        return;
      }
      // Fallback to mock storage for SSR
      mockStorage.setItem(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      // Kiểm tra xem localStorage có tồn tại không (tránh lỗi SSR)
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
        return;
      }
      // Fallback to mock storage for SSR
      mockStorage.removeItem(key);
      return;
    }
    await AsyncStorage.removeItem(key);
  },

  async clear(): Promise<void> {
    if (Platform.OS === 'web') {
      // Kiểm tra xem localStorage có tồn tại không (tránh lỗi SSR)
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.clear();
        return;
      }
      // Fallback to mock storage for SSR
      mockStorage.clear();
      return;
    }
    await AsyncStorage.clear();
  }
};
