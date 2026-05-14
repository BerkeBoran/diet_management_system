import api from './api';

const aiService = {
  generateDiet: (data) => api.post('/ai-dietician/generate/', data),

  checkMeal: (formData) =>
    api.post('/ai-dietician/meal-checker/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getAIPlans: () => api.get('/ai-dietician/plans/'),
  getAIPlanDetail: (id) => api.get(`/ai-dietician/plans/${id}/`),
};

export default aiService;
