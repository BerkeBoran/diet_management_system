import api from './api';

const dietService = {
  getAssignments: async () => {
    const response = await api.get('/diets/assignment/');
    return response.data;
  },

  createAssignment: async (data) => {
    const response = await api.post('/diets/assignment/', data);
    return response.data;
  },

  respondAssignment: async (id, data) => {
    const response = await api.patch(`/diets/assignment/${id}/respond/`, data);
    return response.data;
  },

  getDietPlans: async () => {
    const response = await api.get('/diets/diet-plan/');
    return response.data;
  },

  getDietPlanDetail: async (id) => {
    const response = await api.get(`/diets/diet-plan/${id}/`);
    return response.data;
  },

  createDietPlan: async (data) => {
    const response = await api.post('/diets/diet-plan/', data);
    return response.data;
  },

  getDieticianClients: async () => {
    const response = await api.get('/diets/dietician-clients/');
    return response.data;
  },

  getClientDetail: async (id) => {
    const response = await api.get(`/diets/client-detail/${id}/`);
    return response.data;
  },

  createWeeklyPlan: async (data) => {
    const response = await api.post('/diets/weekly-plan/', data);
    return response.data;
  },

  createDailyPlan: async (data) => {
    const response = await api.post('/diets/daily-plan/', data);
    return response.data;
  },

  createMeal: async (data) => {
    const response = await api.post('/diets/meals/', data);
    return response.data;
  },

  createMealItem: async (data) => {
    const response = await api.post('/diets/meal-items/', data);
    return response.data;
  },
};

export default dietService;
