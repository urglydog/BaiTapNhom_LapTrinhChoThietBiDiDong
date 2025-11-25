import api from './api';

export interface ChatMessageRequest {
  message: string;
}

export interface ChatMessageResponse {
  response: string;
}

/**
 * Gửi tin nhắn đến chatbot AI
 * @param message - Nội dung tin nhắn từ người dùng
 * @returns Phản hồi từ chatbot
 */
export const sendMessage = async (message: string): Promise<string> => {
  try {
    const response = await api.post('/chat/ai', message, {
      headers: { 'Content-Type': 'text/plain' },
    });
    // Response trả về là String trực tiếp, không phải object
    return typeof response.data === 'string' ? response.data : String(response.data);
  } catch (error: any) {
    console.error('Error sending chat message:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Không thể kết nối đến chatbot. Vui lòng thử lại sau.';
    throw new Error(errorMessage);
  }
};

export { sendMessage };

