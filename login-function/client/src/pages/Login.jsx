// client/src/pages/Login.js
import React, { useState, useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/auth/authContext';
import AlertContext from '../context/alert/alertContext';

const Login = () => {
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);

  const { login, error, clearErrors, isAuthenticated, require2FA } = authContext;
  const { setAlert } = alertContext;

  useEffect(() => {
    if (error) {
      setAlert(error, 'danger');
      clearErrors();
    }
    // eslint-disable-next-line
  }, [error]);

  const [user, setUser] = useState({
    email: '',
    password: ''
  });

  const { email, password } = user;

  const onChange = e => setUser({ ...user, [e.target.name]: e.target.value });

  const onSubmit = e => {
    e.preventDefault();
    if (email === '' || password === '') {
      setAlert('Please fill in all fields', 'danger');
    } else {
      login({
        email,
        password
      });
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/profile" />;
  }

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
          />
        </div>
        <input
          type="submit"
          value="Login"
          className="btn btn-primary btn-block"
        />
      </form>
    </div>
  );
};

export default Login;
