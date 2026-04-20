import api from './api';

const foodService = {
  searchFoods: async (query) => {
    const response = await api.get(`/foods/foods/?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  getFoodDetail: async (id, amount = 100, unit = 'g') => {
    const response = await api.get(`/foods/foods/${id}/?amount=${amount}&unit=${unit}`);
    return response.data;
  },

  getFoodByBarcode: async (barcode) => {
    const response = await api.get(`/foods/foods/barcode/${barcode}/`);
    return response.data;
  },
};

export default foodService;