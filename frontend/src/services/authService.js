import api from './api';

const authService = {
  login: async (email, password, role) => {
    const response = await api.post('/users/login/', { email, password, role });
    return response.data;
  },

  registerClient: async (data) => {
    const response = await api.post('/users/register/client/', data);
    return response.data;
  },

  registerDietician: async (data) => {
    const response = await api.post('/users/register/dietician/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  refreshToken: async (refresh) => {
    const response = await api.post('/users/token/refresh/', { refresh });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/users/profile/');
    return response.data;
  },
};

export default authService;