// client/src/context/auth/authReducer.js
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

const authReducer = (state, action) => {
  switch (action.type) {
    case USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload,
        error: null,
        require2FA: false
      };

    case REGISTER_SUCCESS:
      // Don't set token or authenticate user after registration
      // Let them go to login page instead
      return {
        ...state,
        loading: false,
        error: null,
        registrationSuccess: true
      };

    case LOGIN_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        token: action.payload.token,
        isAuthenticated: !action.payload.require2FA,
        require2FA: action.payload.require2FA || false,
        loading: false,
        error: null
      };

    case VERIFY_2FA_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        token: action.payload.token,
        isAuthenticated: true,
        require2FA: false,
        loading: false,
        error: null
      };

    case REGISTER_FAIL:
    case LOGIN_FAIL:
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: action.payload,
        require2FA: false,
        twoFactorSecret: null,
        qrCodeUrl: null,
        registrationSuccess: false
      };

    case AUTH_ERROR:
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: action.payload,
        require2FA: false,
        twoFactorSecret: null,
        qrCodeUrl: null
      };

    case LOGOUT:
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: null,
        require2FA: false,
        twoFactorSecret: null,
        qrCodeUrl: null,
        registrationSuccess: false
      };

    case REQUIRE_2FA:
      return {
        ...state,
        require2FA: true,
        isAuthenticated: false,
        loading: false
      };

    case AUTH_LOADING_COMPLETE:
      return {
        ...state,
        loading: false
      };

    case ENABLE_2FA_SUCCESS:
      return {
        ...state,
        twoFactorSecret: action.payload.secret,
        qrCodeUrl: action.payload.qrCodeUrl,
        loading: false,
        error: null
      };

    case VERIFY_2FA_SETUP_SUCCESS:
      return {
        ...state,
        twoFactorSecret: null,
        qrCodeUrl: null,
        loading: false,
        error: null
      };

    case DISABLE_2FA_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null
      };

    case CLEAR_ERRORS:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

export default authReducer;
