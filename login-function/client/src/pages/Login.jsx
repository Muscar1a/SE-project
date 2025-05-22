// client/src/pages/Login.js
import React, { useState, useContext, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AuthContext from '../context/auth/authContext';
import AlertContext from '../context/alert/alertContext';

const Login = () => {
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);

  const { login, error, clearErrors, isAuthenticated, require2FA, loading, token } = authContext;
  const { setAlert } = alertContext;

  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      setAlert(error, 'danger');
      clearErrors();
    }
  }, [error, setAlert, clearErrors]);

  // Handle successful authentication
  useEffect(() => {
    console.log('Login component state:', { isAuthenticated, require2FA, loading, token: !!token });

    if (isAuthenticated && !require2FA && !loading) {
      console.log('Redirecting to profile...');
      navigate('/profile');
    }
  }, [isAuthenticated, require2FA, loading, navigate, token]);

  const [user, setUser] = useState({
    email: '',
    password: ''
  });

  const { email, password } = user;

  const onChange = e => setUser({ ...user, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (email === '' || password === '') {
      setAlert('Please fill in all fields', 'danger');
    } else {
      console.log('Attempting login...');
      await login({
        email,
        password
      });
    }
  };

  // If already authenticated, redirect
  if (isAuthenticated && !require2FA) {
    return <Navigate to="/profile" />;
  }

  // If 2FA is required, redirect to 2FA page
  if (require2FA) {
    return <Navigate to="/verify-2fa" />;
  }

  return (
    <div className="form-container">
      <h1 className="text-center">Account Login</h1>
      <form onSubmit={onSubmit} className="form">
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            required
            disabled={loading}
          />
        </div>
        <input
          type="submit"
          value={loading ? "Logging in..." : "Login"}
          className="btn btn-primary btn-block"
          disabled={loading}
        />
      </form>
    </div>
  );
};

export default Login;
