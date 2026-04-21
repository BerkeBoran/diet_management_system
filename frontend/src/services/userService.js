import api from './api';

const userService = {
  getDieticians: async () => {
    const response = await api.get('/users/dieticians/');
    return response.data;
  },

  getDieticianDetail: async (id) => {
    const response = await api.get(`/users/dieticians/${id}/`);
    return response.data;
  },

  getDieticianReviews: async (id) => {
    const response = await api.get(`/users/dieticians/${id}/reviews/`);
    return response.data;
  },

  createReview: async (id, data) => {
    const response = await api.post(`/users/dieticians/${id}/reviews/`, data);
    return response.data;
  },

  createHealthSnapshot: async (data) => {
    const response = await api.post('/users/client-health-snapshots/', data);
    return response.data;
  },

  getHealthSnapshots: async () => {
    const response = await api.get('/users/client-health-snapshots/');
    return response.data;
  },
};

export default userService;
