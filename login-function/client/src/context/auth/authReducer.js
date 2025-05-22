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
  console.log('Auth Reducer - Action:', action.type, 'Payload:', action.payload);
  console.log('Auth Reducer - Current State:', state);

  switch (action.type) {
    case USER_LOADED:
      const userLoadedState = {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload,
        error: null,
        require2FA: false
      };
      console.log('Auth Reducer - USER_LOADED new state:', userLoadedState);
      return userLoadedState;

    case REGISTER_SUCCESS:
      // Don't set isAuthenticated yet - wait for USER_LOADED
      localStorage.setItem('token', action.payload.token);
      const registerState = {
        ...state,
        token: action.payload.token,
        loading: false,
        error: null
      };
      console.log('Auth Reducer - REGISTER_SUCCESS new state:', registerState);
      return registerState;

    case LOGIN_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      const loginState = {
        ...state,
        token: action.payload.token,
        isAuthenticated: !action.payload.require2FA,
        require2FA: action.payload.require2FA || false,
        loading: false,
        error: null
      };
      console.log('Auth Reducer - LOGIN_SUCCESS new state:', loginState);
      return loginState;

    case VERIFY_2FA_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      const verify2FAState = {
        ...state,
        token: action.payload.token,
        isAuthenticated: true,
        require2FA: false,
        loading: false,
        error: null
      };
      console.log('Auth Reducer - VERIFY_2FA_SUCCESS new state:', verify2FAState);
      return verify2FAState;

    case REGISTER_FAIL:
    case LOGIN_FAIL:
      localStorage.removeItem('token');
      const failState = {
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
      console.log('Auth Reducer - FAIL new state:', failState);
      return failState;

    case AUTH_ERROR:
      // Token is invalid - clear everything
      localStorage.removeItem('token');
      const errorState = {
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
      console.log('Auth Reducer - AUTH_ERROR new state:', errorState);
      return errorState;

    case LOGOUT:
      // Clear everything on logout
      const logoutState = {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: null,
        require2FA: false,
        twoFactorSecret: null,
        qrCodeUrl: null
      };
      console.log('Auth Reducer - LOGOUT new state:', logoutState);
      return logoutState;

    case REQUIRE_2FA:
      const require2FAState = {
        ...state,
        require2FA: true,
        isAuthenticated: false,
        loading: false
      };
      console.log('Auth Reducer - REQUIRE_2FA new state:', require2FAState);
      return require2FAState;

    case AUTH_LOADING_COMPLETE:
      // Finish loading without changing auth state
      const loadingCompleteState = {
        ...state,
        loading: false
      };
      console.log('Auth Reducer - AUTH_LOADING_COMPLETE new state:', loadingCompleteState);
      return loadingCompleteState;

    case ENABLE_2FA_SUCCESS:
      const enable2FAState = {
        ...state,
        twoFactorSecret: action.payload.secret,
        qrCodeUrl: action.payload.qrCodeUrl,
        loading: false,
        error: null
      };
      console.log('Auth Reducer - ENABLE_2FA_SUCCESS new state:', enable2FAState);
      return enable2FAState;

    case VERIFY_2FA_SETUP_SUCCESS:
      const verify2FASetupState = {
        ...state,
        twoFactorSecret: null,
        qrCodeUrl: null,
        loading: false,
        error: null
        // User will be reloaded after this
      };
      console.log('Auth Reducer - VERIFY_2FA_SETUP_SUCCESS new state:', verify2FASetupState);
      return verify2FASetupState;

    case DISABLE_2FA_SUCCESS:
      const disable2FAState = {
        ...state,
        loading: false,
        error: null
        // User will be reloaded after this
      };
      console.log('Auth Reducer - DISABLE_2FA_SUCCESS new state:', disable2FAState);
      return disable2FAState;

    case CLEAR_ERRORS:
      const clearErrorsState = {
        ...state,
        error: null
      };
      console.log('Auth Reducer - CLEAR_ERRORS new state:', clearErrorsState);
      return clearErrorsState;

    default:
      console.log('Auth Reducer - Unknown action type:', action.type);
      return state;
  }
};

export default authReducer;
