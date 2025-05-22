// client/src/components/debug/AuthDebug.jsx
// Add this component temporarily to debug auth state
import React, { useContext } from 'react';
import AuthContext from '../../context/auth/authContext';

const AuthDebug = () => {
  const authContext = useContext(AuthContext);
  const {
    token,
    isAuthenticated,
    loading,
    user,
    error,
    require2FA
  } = authContext;

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div></div>
  );
};

export default AuthDebug;
