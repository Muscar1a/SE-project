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
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '10px',
      background: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '5px',
      padding: '10px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 1000
    }}>
      <h4>Auth Debug Info</h4>
      <div><strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'null'}</div>
      <div><strong>localStorage token:</strong> {localStorage.getItem('token') ? 'exists' : 'null'}</div>
      <div><strong>isAuthenticated:</strong> {String(isAuthenticated)}</div>
      <div><strong>loading:</strong> {String(loading)}</div>
      <div><strong>require2FA:</strong> {String(require2FA)}</div>
      <div><strong>user:</strong> {user ? user.name || user.email : 'null'}</div>
      <div><strong>error:</strong> {error || 'null'}</div>
      <div><strong>Axios header:</strong> {window.axios?.defaults?.headers?.common['x-auth-token'] ? 'set' : 'not set'}</div>
    </div>
  );
};

export default AuthDebug;
