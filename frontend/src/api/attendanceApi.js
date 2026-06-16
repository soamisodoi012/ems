import axios from './axios';

export const attendanceApi = {
  checkIn: (data) => axios.post('/attendance/check-in', data),
  checkOut: (data) => axios.post('/attendance/check-out', data),
  getAll: (params) => axios.get('/attendance', { params }),
};