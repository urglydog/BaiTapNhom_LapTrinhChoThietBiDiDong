import api from './api';
import { Promotion } from '../types';

export const promotionService = {
  // Lấy danh sách khuyến mãi
  getPromotions: async (): Promise<Promotion[]> => {
    try {
      const response = await api.get('/promotions');
      if (response.data.code === 200) {
        return response.data.result;
      }
      throw new Error(response.data.message || 'Failed to fetch promotions');
    } catch (error: any) {
      // Nếu endpoint chưa tồn tại, trả về mảng rỗng
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  // Lấy khuyến mãi đang hoạt động
  getActivePromotions: async (): Promise<Promotion[]> => {
    try {
      const response = await api.get('/promotions/active');
      if (response.data.code === 200) {
        return response.data.result;
      }
      throw new Error(response.data.message || 'Failed to fetch active promotions');
    } catch (error: any) {
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  // Lấy khuyến mãi theo ID
  getPromotionById: async (id: number): Promise<Promotion> => {
    const response = await api.get(`/promotions/${id}`);
    if (response.data.code === 200) {
      return response.data.result;
    }
    throw new Error(response.data.message || 'Failed to fetch promotion');
  },
};

