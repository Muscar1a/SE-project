// client/src/utils/setAuthToken.js
import axios from 'axios';

const setAuthToken = token => {
  if (token) {
    // Set token in axios header for all requests
    axios.defaults.headers.common['x-auth-token'] = token;
    console.log('Token set in axios headers:', token.substring(0, 20) + '...');
  } else {
    // Remove token from axios header
    delete axios.defaults.headers.common['x-auth-token'];
    console.log('Token removed from axios headers');
  }
};

export default setAuthToken;
