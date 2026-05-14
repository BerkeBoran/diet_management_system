import api from './api';

const userService = {
  getProfile: () => api.get('/users/profile/'),

  getDieticians: () => api.get('/users/dieticians/'),
  getDieticianDetail: (id) => api.get(`/users/dieticians/${id}/`),
  getDieticianReviews: (id) => api.get(`/users/dieticians/${id}/reviews/`),
  postDieticianReview: (id, data) => api.post(`/users/dieticians/${id}/reviews/`, data),

  getHealthSnapshots: () => api.get('/users/client-health-snapshots/'),
  createHealthSnapshot: (data) => api.post('/users/client-health-snapshots/', data),

  updateProfile: (data) => api.patch('/users/profile/', data),

  getSchedule: () => api.get('/users/schedule/'),
  updateSchedule: (data) => api.patch('/users/schedule/0/', data),

  getAssignments: () => api.get('/diets/assignment/'),
};

export default userService;
