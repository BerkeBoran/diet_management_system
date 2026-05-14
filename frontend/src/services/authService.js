import api from './api';

const authService = {
  login: async (email, password, role) => {
    const { data } = await api.post('/users/login/', { email, password, role });
    return data;
  },

  registerClient: async (formData) => {
    const { data } = await api.post('/users/register/client/', formData);
    return data;
  },

  registerDietician: async (formData) => {
    const { data } = await api.post('/users/register/dietician/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  googleLogin: async (accessToken) => {
    const { data } = await api.post('/users/social/google/', { access_token: accessToken });
    return data;
  },

  logout: async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      try {
        await api.post('/auth/logout/', { refresh });
      } catch (_) {}
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  refreshToken: async (refresh) => {
    const { data } = await api.post('/users/token/refresh/', { refresh });
    return data;
  },

  forgotPassword: async (email) => {
    const { data } = await api.post('/auth/password/reset/', { email });
    return data;
  },

  resetPassword: async (uid, token, new_password1, new_password2) => {
    const { data } = await api.post('/auth/password/reset/confirm/', { uid, token, new_password1, new_password2 });
    return data;
  },
};

export default authService;
