import axios from 'axios';

const getBaseURL = () => {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();
  const isBrowser = typeof window !== 'undefined';
  const isLocalhost = isBrowser && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '0.0.0.0'
  );

  // In production deployments (non-localhost hostname), never use localhost
  if (isBrowser && !isLocalhost) {
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1') && !envUrl.includes('0.0.0.0')) {
      return envUrl;
    }
    return '/api';
  }

  // Local development
  if (envUrl) {
    return envUrl;
  }
  return 'http://localhost:5000/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
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
