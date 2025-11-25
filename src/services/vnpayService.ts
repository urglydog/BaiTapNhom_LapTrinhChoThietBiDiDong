import api from './api';

export const vnpayService = {
  // Tạo payment URL từ booking ID
  createPaymentUrl: async (bookingId: number): Promise<string> => {
    try {
      const response = await api.post(`/vnpay/create-payment?bookingId=${bookingId}`);
      if (response.data.code === 200 && response.data.result?.paymentUrl) {
        return response.data.result.paymentUrl;
      }
      throw new Error(response.data.message || 'Failed to create payment URL');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to create payment URL');
    }
  },
};

