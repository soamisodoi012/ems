// import axios from './axios';

// export const userApi = {
//   getAll: () => axios.get('/users'),
//   getById: (id) => axios.get(`/users/${id}`),
//   create: (data) => axios.post('/users', data),
//   update: (id, data) => axios.patch(`/users/${id}`, data),
//   delete: (id) => axios.delete(`/users/${id}`),
//   createUserForEmployee: (employeeId, userData) => axios.post(`/users/employee/${employeeId}`, userData),
// };
import axios from './axios';

export const userApi = {
  getAll: () => axios.get('/users'),
  getById: (id) => axios.get(`/users/${id}`),
  create: (data) => axios.post('/users', data),
  update: (id, data) => axios.patch(`/users/${id}`, data),
  delete: (id) => axios.delete(`/users/${id}`),
  createUserForEmployee: (employeeId, userData) => axios.post(`/users/employee/${employeeId}`, userData),
};