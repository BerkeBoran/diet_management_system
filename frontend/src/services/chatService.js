import api, { WS_BASE_URL } from './api';

const chatService = {
  getChatRooms: async () => {
    const response = await api.get('/chat/chat-rooms/');
    return response.data;
  },

  getChatRoomDetail: async (id) => {
    const response = await api.get(`/chat/chat-rooms/${id}/`);
    return response.data;
  },

  getOrCreateRoom: async (chatUserId) => {
    const response = await api.post('/chat/chat-rooms/get_or_create/', {
      chat_user_id: chatUserId,
    });
    return response.data;
  },

  connectWebSocket: (roomId) => {
    const token = localStorage.getItem('access_token');
    const ws = new WebSocket(`${WS_BASE_URL}/ws/chat/${roomId}/?token=${token}`);
    return ws;
  },
};

export default chatService;
