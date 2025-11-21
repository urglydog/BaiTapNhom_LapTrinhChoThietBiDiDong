import api from './api';
import { Promotion } from '../types';

export const promotionService = {
  // Lấy danh sách khuyến mãi (unique theo code)
  getPromotions: async (): Promise<Promotion[]> => {
    try {
      const response = await api.get('/promotions');
      if (response.data.code === 200) {
        const promotions = response.data.result || [];
        // Filter unique theo code (nếu có) hoặc id
        const uniquePromotions = new Map<string | number, Promotion>();
        
        promotions.forEach((promo: Promotion) => {
          const key = promo.code || promo.id;
          if (!uniquePromotions.has(key)) {
            uniquePromotions.set(key, promo);
          } else {
            // Nếu đã có, giữ promotion có ID lớn hơn (mới hơn)
            const existing = uniquePromotions.get(key);
            if (existing && promo.id > existing.id) {
              uniquePromotions.set(key, promo);
            }
          }
        });
        
        return Array.from(uniquePromotions.values());
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

  // Lấy khuyến mãi đang hoạt động (unique và đang trong thời gian áp dụng)
  getActivePromotions: async (): Promise<Promotion[]> => {
    try {
      const response = await api.get('/promotions/active');
      if (response.data.code === 200) {
        const promotions = response.data.result || [];
        // Filter unique và đang trong thời gian áp dụng
        return promotionService.filterUniqueAndActive(promotions);
      }
      // Fallback: Lấy tất cả và filter
      const allPromotions = await promotionService.getPromotions();
      return promotionService.filterUniqueAndActive(allPromotions);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Fallback: Lấy tất cả và filter
        const allPromotions = await promotionService.getPromotions();
        return promotionService.filterUniqueAndActive(allPromotions);
      }
      throw error;
    }
  },
  
  // Helper: Filter unique và đang active
  filterUniqueAndActive: (promotions: Promotion[]): Promotion[] => {
    const now = new Date();
    const uniquePromotions = new Map<string | number, Promotion>();
    
    promotions.forEach((promo) => {
      const startDate = new Date(promo.startDate);
      const endDate = new Date(promo.endDate);
      endDate.setHours(23, 59, 59, 999);
      
      // Chỉ lấy promotion đang trong thời gian áp dụng
      if (now >= startDate && now <= endDate) {
        const key = promo.code || promo.id;
        if (!uniquePromotions.has(key)) {
          uniquePromotions.set(key, promo);
        } else {
          const existing = uniquePromotions.get(key);
          if (existing && promo.id > existing.id) {
            uniquePromotions.set(key, promo);
          }
        }
      }
    });
    
    return Array.from(uniquePromotions.values());
  },
  
  // Lấy khuyến mãi có thể sử dụng (unique, active, chưa hết lượt)
  getAvailablePromotions: async (): Promise<Promotion[]> => {
    try {
      const response = await api.get('/promotions/available');
      if (response.data.code === 200) {
        const promotions = response.data.result || [];
        return promotionService.filterUniqueAndAvailable(promotions);
      }
      // Fallback: Lấy active và filter
      const activePromotions = await promotionService.getActivePromotions();
      return promotionService.filterUniqueAndAvailable(activePromotions);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Fallback: Lấy active và filter
        const activePromotions = await promotionService.getActivePromotions();
        return promotionService.filterUniqueAndAvailable(activePromotions);
      }
      throw error;
    }
  },
  
  // Helper: Filter unique và available (chưa hết lượt)
  filterUniqueAndAvailable: (promotions: Promotion[]): Promotion[] => {
    const now = new Date();
    const uniquePromotions = new Map<string | number, Promotion>();
    
    promotions.forEach((promo) => {
      const startDate = new Date(promo.startDate);
      const endDate = new Date(promo.endDate);
      endDate.setHours(23, 59, 59, 999);
      
      // Kiểm tra thời gian và lượt sử dụng
      const isInTimeRange = now >= startDate && now <= endDate;
      const hasUsageLeft = !promo.usageLimit || 
        (promo.usageLimit && (!promo.usedCount || promo.usedCount < promo.usageLimit));
      
      if (isInTimeRange && hasUsageLeft) {
        const key = promo.code || promo.id;
        if (!uniquePromotions.has(key)) {
          uniquePromotions.set(key, promo);
        } else {
          const existing = uniquePromotions.get(key);
          if (existing && promo.id > existing.id) {
            uniquePromotions.set(key, promo);
          }
        }
      }
    });
    
    return Array.from(uniquePromotions.values());
  },

  // Lấy khuyến mãi theo ID
  getPromotionById: async (id: number): Promise<Promotion> => {
    const response = await api.get(`/promotions/${id}`);
    if (response.data.code === 200) {
      return response.data.result;
    }
    throw new Error(response.data.message || 'Failed to fetch promotion');
  },

  // Lấy tất cả khuyến mãi (unique)
  getAllPromotions: async (): Promise<Promotion[]> => {
    try {
      // Sử dụng getPromotions vì nó đã filter unique
      return await promotionService.getPromotions();
    } catch (error: any) {
      console.error('Error fetching all promotions:', error);
      return [];
    }
  },
  
  // Lấy khuyến mãi đã hết hạn (unique)
  getExpiredPromotions: async (): Promise<Promotion[]> => {
    try {
      const allPromotions = await promotionService.getPromotions();
      const now = new Date();
      
      return allPromotions.filter((promo) => {
        const endDate = new Date(promo.endDate);
        endDate.setHours(23, 59, 59, 999);
        return now > endDate;
      });
    } catch (error: any) {
      console.error('Error fetching expired promotions:', error);
      return [];
    }
  },

};

