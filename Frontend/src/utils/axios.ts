import axios from 'axios';

// Create a custom axios instance
const API = axios.create({
  baseURL: '/', // Uses Vite proxy in dev (localhost:5173 -> localhost:5000)
});

// Add a request interceptor to attach the JWT token
API.interceptors.request.use(
  (config) => {
    const savedUser = localStorage.getItem('userInfo');
    if (savedUser) {
      const { token } = JSON.parse(savedUser);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiry globally if needed
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optional: Handle 401 globally
      localStorage.removeItem('userInfo');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
