import api from './api';

const appointmentService = {
  getDailySlots: async (dieticianId, date) => {
    const response = await api.get('/appointments/dietician-availability/daily_slots/', {
      params: { dietician: dieticianId, date },
    });
    return response.data;
  },

  createAppointment: async (data) => {
    const response = await api.post('/appointments/appointment/', data);
    return response.data;
  },

  getAppointments: async () => {
    const response = await api.get('/appointments/appointment/');
    return response.data;
  },
};

export default appointmentService;
