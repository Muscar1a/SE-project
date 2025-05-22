// client/src/components/routing/PrivateRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../../context/auth/authContext';

const PrivateRoute = ({ children }) => {
  const authContext = useContext(AuthContext);
  const { isAuthenticated, loading, require2FA } = authContext;

  // Show loading spinner while auth is being checked
  if (loading) {
    return <div className="spinner-container"><div className="spinner"></div></div>;
  }

  // Redirect to 2FA verification if required
  if (require2FA) {
    return <Navigate to="/verify-2fa" />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated && !loading) {
    return <Navigate to="/login" />;
  }

  // User is authenticated, render the protected component
  return children;
};

export default PrivateRoute;
