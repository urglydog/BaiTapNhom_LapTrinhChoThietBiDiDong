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
    try {
      const response = await api.get('/bookings');
      if (response.data.code === 200) {
        const bookings = response.data.result || [];
        // Chuyển đổi bookingItems thành seats nếu cần
        return bookings.map((booking: any) => {
          if (booking.bookingItems && !booking.seats) {
            booking.seats = booking.bookingItems.map((item: any) => ({
              id: item.id,
              bookingId: booking.id,
              seatId: item.seatId,
              seat: item.seat,
              seatNumber: item.seat?.seatNumber,
              seatRow: item.seat?.seatRow,
            }));
          }
          return booking;
        });
      }
      throw new Error(response.data.message || 'Failed to fetch bookings');
    } catch (error: any) {
      // Xử lý lỗi Hibernate proxy
      if (error.message?.includes('ByteBuddyInterceptor') || error.message?.includes('Type definition error')) {
        console.error('Hibernate proxy error');
        throw new Error('Không thể tải danh sách đặt vé. Vui lòng thử lại sau.');
      }
      throw error;
    }
  },

  // Lấy chi tiết booking
  getBookingById: async (id: number): Promise<Booking> => {
    try {
      const response = await api.get(`/bookings/${id}`);
      
      // Kiểm tra response data có lỗi Hibernate proxy không
      const responseString = JSON.stringify(response.data || {});
      if (
        responseString.includes('ByteBuddyInterceptor') ||
        responseString.includes('Type definition error') ||
        responseString.includes('Hibernate')
      ) {
        console.warn('Hibernate proxy detected in response, using fallback');
        throw new Error('HIBERNATE_PROXY_ERROR');
      }
      
      if (response.data.code === 200 && response.data.result) {
        const booking = response.data.result;
        // Chuyển đổi bookingItems thành seats nếu cần
        if (booking.bookingItems && !booking.seats) {
          booking.seats = booking.bookingItems.map((item: any) => ({
            id: item.id,
            bookingId: booking.id,
            seatId: item.seatId,
            seat: item.seat,
            seatNumber: item.seat?.seatNumber,
            seatRow: item.seat?.seatRow,
          }));
        }
        return booking;
      }
      throw new Error(response.data.message || 'Failed to fetch booking');
    } catch (error: any) {
      // Kiểm tra lỗi từ response data
      const errorMessage = error?.response?.data?.message || error?.message || '';
      const errorString = JSON.stringify(error?.response?.data || error || {});
      const isHibernateError = 
        errorMessage === 'HIBERNATE_PROXY_ERROR' ||
        errorMessage.includes('ByteBuddyInterceptor') || 
        errorMessage.includes('Type definition error') ||
        errorString.includes('ByteBuddyInterceptor') ||
        errorString.includes('Type definition error') ||
        errorString.includes('Hibernate');
      
      if (isHibernateError) {
        console.error('Hibernate proxy error detected, trying fallback method');
        
        // Thử lấy từ danh sách bookings như fallback
        try {
          const allBookings = await bookingService.getUserBookings();
          const booking = allBookings.find(b => b.id === id);
          if (booking) {
            console.log('Found booking in list, using as fallback');
            return booking;
          }
        } catch (fallbackError) {
          console.error('Fallback method also failed:', fallbackError);
        }
        
        throw new Error('Không thể tải thông tin vé do lỗi kỹ thuật. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.');
      }
      
      // Nếu là lỗi khác, throw lại với message rõ ràng hơn
      const finalMessage = errorMessage || error?.message || 'Không thể tải thông tin vé';
      throw new Error(finalMessage);
    }
  },

  // Lấy booking theo booking code (fallback method)
  getBookingByCode: async (bookingCode: string): Promise<Booking> => {
    try {
      const response = await api.get(`/bookings/booking-code/${bookingCode}`);
      if (response.data.code === 200) {
        const booking = response.data.result;
        // Chuyển đổi bookingItems thành seats nếu cần
        if (booking.bookingItems && !booking.seats) {
          booking.seats = booking.bookingItems.map((item: any) => ({
            id: item.id,
            bookingId: booking.id,
            seatId: item.seatId,
            seat: item.seat,
            seatNumber: item.seat?.seatNumber,
            seatRow: item.seat?.seatRow,
          }));
        }
        return booking;
      }
      throw new Error(response.data.message || 'Failed to fetch booking');
    } catch (error: any) {
      throw error;
    }
  },

  // Hủy booking
  cancelBooking: async (id: number): Promise<void> => {
    const response = await api.delete(`/bookings/${id}`);
    if (response.data.code !== 200) {
      throw new Error(response.data.message || 'Failed to cancel booking');
    }
  },
};
