import axios from './axios';

export const leaveApi = {
  applyLeave: (data) => axios.post('/leaves/apply', data),
  getAll: (params) => axios.get('/leaves', { params }),
  getById: (id) => axios.get(`/leaves/${id}`),
  approveLeave: (id) => axios.patch(`/leaves/${id}/approve`),
  cancelLeave: (id) => axios.patch(`/leaves/${id}/cancel`),
  getLeaveBalance: (employeeId) => axios.get(`/leaves/balance/${employeeId}`),
};