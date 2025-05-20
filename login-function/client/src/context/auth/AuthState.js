// client/src/context/auth/AuthState.js
import React, { useReducer } from 'react';
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
  DISABLE_2FA_SUCCESS
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

  // Load User
  const loadUser = async () => {
    if (localStorage.token) {
      setAuthToken(localStorage.token);
    }

    try {
      const res = await axios.get(`${API_URL}/api/auth`);

      dispatch({
        type: USER_LOADED,
        payload: res.data
      });
    } catch (err) {
      if (err.response && err.response.status === 401 && err.response.data.require2FA) {
        dispatch({ type: REQUIRE_2FA });
      } else {
        dispatch({ type: AUTH_ERROR });
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

      loadUser();
    } catch (err) {
      dispatch({
        type: REGISTER_FAIL,
        payload: err.response.data.msg
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

      dispatch({
        type: LOGIN_SUCCESS,
        payload: res.data
      });

      if (!res.data.require2FA) {
        loadUser();
      }
    } catch (err) {
      dispatch({
        type: LOGIN_FAIL,
        payload: err.response.data.msg
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

      loadUser();
    } catch (err) {
      dispatch({
        type: LOGIN_FAIL,
        payload: err.response.data.msg
      });
    }
  };

  // Enable 2FA
  const enable2FA = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/enable-2fa`);

      dispatch({
        type: ENABLE_2FA_SUCCESS,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: AUTH_ERROR,
        payload: err.response.data.msg
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
    } catch (err) {
      dispatch({
        type: AUTH_ERROR,
        payload: err.response.data.msg
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
    } catch (err) {
      dispatch({
        type: AUTH_ERROR,
        payload: err.response.data.msg
      });
    }
  };

  // Logout
  const logout = () => dispatch({ type: LOGOUT });

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
