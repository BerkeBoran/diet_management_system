import api from './api';

const subscriptionService = {
  getStatus: async () => {
    const { data } = await api.get('/subscription/status/');
    return data;
  },
  createSubscription: async (subscriptionDuration) => {
    const { data } = await api.post('/subscription/ai_dietician_subscription/', {
      subscription_duration: subscriptionDuration,
    });
    return data;
  },
};

export default subscriptionService;
