import api from './api';

const foodService = {
  searchFoods: (q) => api.get('/foods/foods/', { params: { q } }),
  getFoodDetail: (id, amount, unit = 'g') =>
    api.get(`/foods/foods/${id}/`, { params: { amount, unit } }),
  getFoodByBarcode: (barcode) => api.get(`/foods/foods/barcode/${barcode}/`),
};

export default foodService;
