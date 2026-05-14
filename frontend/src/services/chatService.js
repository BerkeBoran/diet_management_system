import api from './api';

const chatService = {
  getRooms: () => api.get('/chat/chat-rooms/'),
  getRoomDetail: (roomId) => api.get(`/chat/chat-rooms/${roomId}/`),
  getOrCreateRoom: (chatUserId) =>
    api.post('/chat/chat-rooms/get_or_create/', { chat_user_id: chatUserId }),

  createWebSocket: (roomId) => {
    const token = localStorage.getItem('access_token');
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    return new WebSocket(`${protocol}://${window.location.host}/ws/chat/${roomId}/?token=${token}`);
  },
};

export default chatService;
