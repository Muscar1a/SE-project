// client/src/context/auth/AuthState.jsx
import React, { useReducer, useEffect } from 'react';
import axios from 'axios';
import AuthContext from './authContext';
import authReducer from './authReducer';
import setAuthToken from '../../utils/setAuthToken';
import { API_URL } from '../../config';
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  CLEAR_ERRORS,
  ENABLE_2FA_SUCCESS,
  VERIFY_2FA_SETUP_SUCCESS,
  VERIFY_2FA_SUCCESS,
  REQUIRE_2FA,
  DISABLE_2FA_SUCCESS,
  AUTH_LOADING_COMPLETE
} from '../types';

const AuthState = (props) => {
  const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null,
    error: null,
    require2FA: false,
    twoFactorSecret: null,
    qrCodeUrl: null,
    registrationSuccess: false
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication on app load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        setAuthToken(token);
        try {
          await loadUser();
        } catch (error) {
          if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            setAuthToken(null);
            dispatch({ type: AUTH_ERROR });
          } else {
            dispatch({ type: AUTH_LOADING_COMPLETE });
          }
        }
      } else {
        dispatch({ type: AUTH_LOADING_COMPLETE });
      }
    };

    initAuth();
  }, []);

  // Load User
  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
    } else {
      dispatch({ type: AUTH_ERROR });
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/api/auth`);

      dispatch({
        type: USER_LOADED,
        payload: res.data
      });
    } catch (err) {
      if (err.response && err.response.status === 401) {
        const responseData = err.response.data;
        if (responseData.require2FA) {
          dispatch({ type: REQUIRE_2FA });
        } else {
          localStorage.removeItem('token');
          setAuthToken(null);
          dispatch({ type: AUTH_ERROR });
        }
      } else {
        dispatch({ type: AUTH_LOADING_COMPLETE });
      }
    }
  };

  // Register User
  const register = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const res = await axios.post(`${API_URL}/api/users`, formData, config);

      dispatch({
        type: REGISTER_SUCCESS,
        payload: res.data
      });

      // Don't automatically load user or authenticate after registration
      // Let the user go to login page instead
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.msg || 'Registration failed';
      dispatch({
        type: REGISTER_FAIL,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Login User
  const login = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, formData, config);

      dispatch({
        type: LOGIN_SUCCESS,
        payload: res.data
      });

      if (!res.data.require2FA) {
        setTimeout(async () => {
          try {
            await loadUser();
          } catch (error) {
            // Handle error silently
          }
        }, 100);
      }
    } catch (err) {
      dispatch({
        type: LOGIN_FAIL,
        payload: err.response?.data?.msg || 'Login failed'
      });
    }
  };

  // Verify 2FA during login
  const verify2FA = async (token, userId) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const res = await axios.post(
        `${API_URL}/api/auth/verify-2fa`,
        { token, userId },
        config
      );

      dispatch({
        type: VERIFY_2FA_SUCCESS,
        payload: res.data
      });

      await loadUser();
    } catch (err) {
      dispatch({
        type: LOGIN_FAIL,
        payload: err.response?.data?.msg || '2FA verification failed'
      });
    }
  };

  // Enable 2FA
  const enable2FA = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/enable-2fa`);

      dispatch({
        type: ENABLE_2FA_SUCCESS,
        payload: {
          secret: res.data.secret,
          qrCodeUrl: res.data.qrCode
        }
      });
    } catch (err) {
      dispatch({
        type: AUTH_ERROR,
        payload: err.response?.data?.msg || 'Failed to enable 2FA'
      });
    }
  };

  // Verify and complete 2FA setup
  const verify2FASetup = async (token) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const res = await axios.post(
        `${API_URL}/api/auth/verify-2fa-setup`,
        { token },
        config
      );

      dispatch({
        type: VERIFY_2FA_SETUP_SUCCESS,
        payload: res.data
      });

      await loadUser();
    } catch (err) {
      dispatch({
        type: AUTH_ERROR,
        payload: err.response?.data?.msg || '2FA setup verification failed'
      });
    }
  };

  // Disable 2FA
  const disable2FA = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/disable-2fa`);

      dispatch({
        type: DISABLE_2FA_SUCCESS,
        payload: res.data
      });

      await loadUser();
    } catch (err) {
      dispatch({
        type: AUTH_ERROR,
        payload: err.response?.data?.msg || 'Failed to disable 2FA'
      });
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    dispatch({ type: LOGOUT });
  };

  // Clear Errors
  const clearErrors = () => dispatch({ type: CLEAR_ERRORS });

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        error: state.error,
        require2FA: state.require2FA,
        twoFactorSecret: state.twoFactorSecret,
        qrCodeUrl: state.qrCodeUrl,
        registrationSuccess: state.registrationSuccess,
        register,
        loadUser,
        login,
        logout,
        clearErrors,
        enable2FA,
        verify2FASetup,
        verify2FA,
        disable2FA
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthState;
