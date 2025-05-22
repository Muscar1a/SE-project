// client/src/context/auth/AuthState.js
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
    qrCodeUrl: null
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication on app load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');

      console.log('Initializing auth, token exists:', !!token);

      if (token) {
        setAuthToken(token);
        try {
          await loadUser();
        } catch (error) {
          console.error('Failed to load user on init:', error);
          // Only clear token if it's actually invalid (401)
          if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            setAuthToken(null);
            dispatch({ type: AUTH_ERROR });
          } else {
            // For network errors, etc., just stop loading
            dispatch({ type: AUTH_LOADING_COMPLETE });
          }
        }
      } else {
        // No token, just finish loading
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
      console.log('Loading user...');
      const res = await axios.get(`${API_URL}/api/auth`);
      console.log('User loaded successfully:', res.data);

      dispatch({
        type: USER_LOADED,
        payload: res.data
      });
    } catch (err) {
      console.error('Error loading user:', err.response?.data || err.message);

      if (err.response && err.response.status === 401) {
        const responseData = err.response.data;
        if (responseData.require2FA) {
          dispatch({ type: REQUIRE_2FA });
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('token');
          setAuthToken(null);
          dispatch({ type: AUTH_ERROR });
        }
      } else {
        // Network error or other issue - don't clear token
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

      // Load user after successful registration
      await loadUser();
    } catch (err) {
      console.error('Registration error:', err.response?.data || err.message);
      dispatch({
        type: REGISTER_FAIL,
        payload: err.response?.data?.msg || 'Registration failed'
      });
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
      console.log('Login response:', res.data);

      dispatch({
        type: LOGIN_SUCCESS,
        payload: res.data
      });

      // IMPORTANT: If 2FA is not required, load user immediately
      if (!res.data.require2FA) {
        console.log('No 2FA required, loading user...');
        setTimeout(async () => {
          try {
            await loadUser();
            console.log('User loaded after login');
          } catch (error) {
            console.error('Failed to load user after login:', error);
          }
        }, 100); // Small delay to ensure state is updated
      } else {
        console.log('2FA required, not loading user yet');
      }
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
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

      // Load user after successful 2FA verification
      await loadUser();
    } catch (err) {
      console.error('2FA verification error:', err.response?.data || err.message);
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
      console.error('Enable 2FA error:', err.response?.data || err.message);
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

      // Reload user to get updated 2FA status
      await loadUser();
    } catch (err) {
      console.error('2FA setup verification error:', err.response?.data || err.message);
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

      // Reload user to get updated 2FA status
      await loadUser();
    } catch (err) {
      console.error('Disable 2FA error:', err.response?.data || err.message);
      dispatch({
        type: AUTH_ERROR,
        payload: err.response?.data?.msg || 'Failed to disable 2FA'
      });
    }
  };

  // Logout
  const logout = () => {
    console.log('Logging out...');
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
