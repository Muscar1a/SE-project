// client/src/pages/VerifyTwoFactor.js
import React, { useState, useContext, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AuthContext from '../context/auth/authContext';
import AlertContext from '../context/alert/alertContext';
import { jwtDecode } from 'jwt-decode';

const VerifyTwoFactor = () => {
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);

  const { verify2FA, error, clearErrors, isAuthenticated, require2FA } = authContext;
  const { setAlert } = alertContext;

  const navigate = useNavigate();

  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    // Get user ID from JWT token for 2FA verification
    if (localStorage.token) {
      try {
        const decoded = jwtDecode(localStorage.token);
        setUserId(decoded.user.id);
      } catch (err) {
        console.error('Invalid token');
        navigate('/login');
      }
    } else {
      navigate('/login');
    }

    if (error) {
      setAlert(error, 'danger');
      clearErrors();
    }
    // eslint-disable-next-line
  }, [error]);

  const onChange = e => setToken(e.target.value);

  const onSubmit = e => {
    e.preventDefault();
    if (token === '') {
      setAlert('Please enter verification code', 'danger');
    } else {
      verify2FA(token, userId);
    }
  };

  if (isAuthenticated && !require2FA) {
    return <Navigate to="/profile" />;
  }

  return (
    <div className="form-container">
      <h1 className="text-center">Two-Factor Authentication</h1>
      <p className="text-center">
        Please enter the verification code from your authenticator app
      </p>
      <form onSubmit={onSubmit} className="form">
        <div className="form-group">
          <label htmlFor="token">Verification Code</label>
          <input
            type="text"
            name="token"
            value={token}
            onChange={onChange}
            placeholder="Enter 6-digit code"
            required
          />
        </div>
        <input
          type="submit"
          value="Verify"
          className="btn btn-primary btn-block"
        />
      </form>
    </div>
  );
};

export default VerifyTwoFactor;
