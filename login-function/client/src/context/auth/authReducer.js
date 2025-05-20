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
  DISABLE_2FA_SUCCESS
} from '../types';

const authReducer = (state, action) => {
  switch (action.type) {
    case USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload
      };
    case REGISTER_SUCCESS:
    case LOGIN_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        ...action.payload,
        isAuthenticated: !action.payload.require2FA,
        require2FA: action.payload.require2FA || false,
        loading: false
      };
    case VERIFY_2FA_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true,
        require2FA: false,
        loading: false
      };
    case REGISTER_FAIL:
    case AUTH_ERROR:
    case LOGIN_FAIL:
    case LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: action.payload,
        require2FA: false
      };
    case REQUIRE_2FA:
      return {
        ...state,
        require2FA: true,
        loading: false
      };
    case ENABLE_2FA_SUCCESS:
      return {
        ...state,
        twoFactorSecret: action.payload.secret,
        qrCodeUrl: action.payload.qrCodeUrl,
        loading: false
      };
    case VERIFY_2FA_SETUP_SUCCESS:
      return {
        ...state,
        twoFactorSecret: null,
        qrCodeUrl: null,
        loading: false,
        user: {
          ...state.user,
          isTwoFactorEnabled: true
        }
      };
    case DISABLE_2FA_SUCCESS:
      return {
        ...state,
        user: {
          ...state.user,
          isTwoFactorEnabled: false
        },
        loading: false
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
