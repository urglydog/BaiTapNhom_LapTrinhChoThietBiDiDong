import api from './api';

const sendMessage = async (message: string): Promise<string> => {
  console.log('Chat AI request:', message);
  
  try {
    const response = await api.post('/api/chat/ai', message, {
      headers: { 'Content-Type': 'text/plain' },
    });
    
    console.log('Chat AI response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export { sendMessage };
