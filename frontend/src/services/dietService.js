import api from './api';

const dietService = {
  getAssignments: () => api.get('/diets/assignment/'),
  createAssignment: (data) => api.post('/diets/assignment/', data),
  respondToAssignment: (id, data) => api.patch(`/diets/assignment/${id}/respond/`, data),

  getDieticianClients: () => api.get('/diets/dietician-clients/'),
  getClientDetail: (id) => api.get(`/diets/client-detail/${id}/`),

  getPlans: () => api.get('/diets/diet-plan/'),
  getPlanDetail: (id) => api.get(`/diets/diet-plan/${id}/`),
  createPlan: (data) => api.post('/diets/diet-plan/', data),
  updatePlanStatus: (id, status) => api.patch(`/diets/diet-plan/${id}/status/`, { status }),
};

export default dietService;
