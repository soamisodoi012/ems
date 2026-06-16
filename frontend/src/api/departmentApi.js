import axios from './axios';

export const departmentApi = {
  getAll: () => axios.get('/departments'),
  getById: (id) => axios.get(`/departments/${id}`),
  create: (data) => axios.post('/departments', data),
  update: (id, data) => axios.patch(`/departments/${id}`, data),
  delete: (id) => axios.delete(`/departments/${id}`),
};