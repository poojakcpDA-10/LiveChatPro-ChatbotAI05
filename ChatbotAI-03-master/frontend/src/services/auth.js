
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api/auth';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
      localStorage.removeItem('salesUser');
      // Redirect to login page if needed
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  // Login function that can handle both user and sales endpoints
  loginTo: async (endpoint, credentials) => {
    try {
      const response = await apiClient.post(endpoint, credentials);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Regular user login
  login: async (credentials) => {
    return authAPI.loginTo('/login', credentials);
  },

  // Sales login
  salesLogin: async (credentials) => {
    return authAPI.loginTo('/sales/login', credentials);
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await apiClient.post('/register', userData);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Register sales person
  salesRegister: async (userData) => {
    try {
      const response = await apiClient.post('/sales/register', userData);
      return response;
    } catch (error) {
      console.error('Sales registration error:', error);
      throw error;
    }
  },

  // Verify token
  verifyToken: async () => {
    try {
      const response = await apiClient.get('/verify');
      return response;
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      const response = await apiClient.post('/logout');
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
      localStorage.removeItem('salesUser');
      return response;
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local storage even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
      localStorage.removeItem('salesUser');
      throw error;
    }
  }
};

export default authAPI;
