// import axios from './axios';

// export const authApi = {
//   login: (credentials) => axios.post('/auth/login', credentials),
//   register: (userData) => axios.post('/auth/register', userData),
//   getMe: () => axios.get('/auth/me'),
//   updatePassword: (data) => axios.patch('/auth/update-password', data),
// };
import axios from './axios';

export const authApi = {
  login: (credentials) => axios.post('/auth/login', credentials),
  register: (userData) => axios.post('/auth/register', userData),
  getMe: () => {
    console.log('Calling getMe...');
    return axios.get('/auth/me');
  },
  updatePassword: (data) => axios.patch('/auth/update-password', data),
};