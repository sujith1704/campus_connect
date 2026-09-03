import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('campusconnect_token') || null);
  const [loading, setLoading] = useState(false); // Don't block initial render
  const [isInitialized, setIsInitialized] = useState(false);
  const [authSessionId, setAuthSessionId] = useState(0);

  useEffect(() => {
    // Non-blocking auth verification - runs after initial render
    const verifyAuth = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (error) {
          console.error('Failed to authenticate token:', error);
          localStorage.removeItem('campusconnect_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsInitialized(true);
    };

    verifyAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('campusconnect_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setAuthSessionId((currentId) => currentId + 1);
      return res.data;
    }
  };

  const loginWithGoogle = async (googleAuthData) => {
    const res = await API.post('/auth/google', googleAuthData);
    if (res.data.success) {
      localStorage.setItem('campusconnect_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setAuthSessionId((currentId) => currentId + 1);
      return res.data;
    }
  };

  const register = async (userData) => {
    const res = await API.post('/auth/register', userData);
    if (res.data.success) {
      localStorage.setItem('campusconnect_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setAuthSessionId((currentId) => currentId + 1);
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('campusconnect_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isInitialized,
        authSessionId,
        login,
        register,
        loginWithGoogle,
        logout,
        isAuthenticated: !!user,
        isStudent: user?.role === 'student',
        isOrganizer: user?.role === 'organizer',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
