// client/src/components/routing/PrivateRoute.js
import React, { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../../context/auth/authContext';

const PrivateRoute = ({ children }) => {
  const authContext = useContext(AuthContext);
  const { isAuthenticated, loading, loadUser, require2FA } = authContext;

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line
  }, []);

  if (loading) {
    return <div className="spinner-container"><div className="spinner"></div></div>;
  }

  if (require2FA) {
    return <Navigate to="/verify-2fa" />;
  }

  if (!isAuthenticated && !loading) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
