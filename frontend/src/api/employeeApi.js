import axios from './axios';

export const employeeApi = {
  getAll: (params) => axios.get('/employees', { params }),
  getById: (id) => axios.get(`/employees/${id}`),
  create: (data) => axios.post('/employees', data),
  update: (id, data) => axios.patch(`/employees/${id}`, data),
  delete: (id) => axios.delete(`/employees/${id}`),
};