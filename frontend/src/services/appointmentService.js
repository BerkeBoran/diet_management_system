import api from './api';

const appointmentService = {
  getAvailableSlots: (dieticianId, date) =>
    api.get('/appointments/available-slots/', {
      params: { dietician_id: dieticianId, date },
    }),

  getAppointments: () => api.get('/appointments/appointment/'),
  createAppointment: (data) => api.post('/appointments/appointment/', data),
  updateAppointment: (id, data) => api.patch(`/appointments/appointment/${id}/`, data),

  getUnavailabilities: () => api.get('/appointments/unavailabilities/'),
  createUnavailability: (data) => api.post('/appointments/unavailabilities/', data),
  deleteUnavailability: (id) => api.delete(`/appointments/unavailabilities/${id}/`),
  updateUnavailability: (id, data) => api.patch(`/appointments/unavailabilities/${id}/`, data),
};

export default appointmentService;
