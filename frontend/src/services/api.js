import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 8000,
});

// Callback to retrieve fresh authentication session token
let authTokenGetter = null;

export const setAuthTokenGetter = (getter) => {
  authTokenGetter = getter;
};

// Request interceptor to add authentication Bearer token to headers
API.interceptors.request.use(
  async (config) => {
    // If Authorization header was already explicitly provided, keep it
    if (config.headers?.Authorization) {
      return config;
    }

    let token = null;

    if (typeof authTokenGetter === 'function') {
      try {
        token = await authTokenGetter();
      } catch (e) {
        // Token getter error handled gracefully
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
