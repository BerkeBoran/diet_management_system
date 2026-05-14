import api from './api';

const paymentService = {
  initiatePayment: async (subscriptionDuration) => {
    const { data } = await api.post('/payment/ai-subscription/initiate/', {
      subscription_duration: subscriptionDuration,
    });
    return data;
  },

  getStatus: async (paymentId) => {
    const { data } = await api.get(`/payment/status/${paymentId}/`);
    return data;
  },
};

export default paymentService;
