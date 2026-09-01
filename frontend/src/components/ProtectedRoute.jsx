import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, isInitialized } = useContext(AuthContext);
  const location = useLocation();
  const isAuthenticated = !!user;

  // If we have no token, immediately redirect to login (don't wait for async verification)
  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If we have a token but haven't finished verifying auth yet, show loading spinner
  // This should be quick after the initial page load
  if (!isInitialized) {
    return (
      <div className="spinner-container" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
        <p>Verifying session...</p>
      </div>
    );
  }

  // If unauthenticated after verification, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If role is restricted and current user role does not match, redirect to Home
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
