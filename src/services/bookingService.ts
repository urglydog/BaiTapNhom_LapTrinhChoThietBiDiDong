import api from './api';
import { Booking } from '../types';

export const bookingService = {
  // Tạo booking mới
  createBooking: async (bookingData: {
    showtimeId: number;
    seatIds: number[];
    promotionCode?: string;
    paymentMethod?: string;
  }): Promise<Booking> => {
    // Thêm paymentMethod mặc định nếu không có
    const requestData = {
      ...bookingData,
      paymentMethod: bookingData.paymentMethod || 'CASH',
    };
    
    const response = await api.post('/bookings', requestData);
    // API có thể trả về code 200 hoặc 201
    if (response.data.code === 200 || response.data.code === 201) {
      return response.data.result;
    }
    throw new Error(response.data.message || 'Failed to create booking');
  },

  // Lấy danh sách booking của user
  getUserBookings: async (): Promise<Booking[]> => {
    const response = await api.get('/bookings');
    if (response.data.code === 200) {
      return response.data.result;
    }
    throw new Error(response.data.message || 'Failed to fetch bookings');
  },

  // Lấy chi tiết booking
  getBookingById: async (id: number): Promise<Booking> => {
    const response = await api.get(`/bookings/${id}`);
    if (response.data.code === 200) {
      return response.data.result;
    }
    throw new Error(response.data.message || 'Failed to fetch booking');
  },

  // Hủy booking
  cancelBooking: async (id: number): Promise<void> => {
    const response = await api.delete(`/bookings/${id}`);
    if (response.data.code !== 200) {
      throw new Error(response.data.message || 'Failed to cancel booking');
    }
  },
};
