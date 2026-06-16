import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`Making request to: ${config.url}`, { method: config.method, hasToken: !!token });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Initial token exists?', !!token);
    
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      console.log('Loading user...');
      const response = await api.get('/auth/me');
      console.log('Load user response:', response.data);
      
      if (response.data && response.data.status === 'success' && response.data.data && response.data.data.user) {
        setUser(response.data.data.user);
        console.log('User loaded successfully:', response.data.data.user);
      } else {
        console.error('Invalid user data structure');
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', { email });
      const response = await api.post('/auth/login', { email, password });
      console.log('Full login response:', response.data);
      
      if (response.data && response.data.status === 'success' && response.data.data) {
        const { token, user } = response.data.data;
        
        if (token && user) {
          // Store token
          localStorage.setItem('token', token);
          setUser(user);
          toast.success('Login successful!');
          console.log('Login successful, token stored:', token.substring(0, 20) + '...');
          console.log('User:', user);
          return true;
        } else {
          console.error('Missing token or user:', { token: !!token, user: !!user });
          throw new Error('Missing token or user in response');
        }
      } else {
        console.error('Invalid response structure:', response.data);
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('Login error details:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || error.message || 'Login failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const response = await api.patch('/auth/update-password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      
      if (response.data && response.data.status === 'success' && response.data.data) {
        const { token, user } = response.data.data;
        localStorage.setItem('token', token);
        setUser(user);
        toast.success('Password updated successfully');
        return true;
      }
      return false;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updatePassword, loading }}>
      {children}
    </AuthContext.Provider>
  );
};