import { API_URL } from './config.js';

/**
 * Example function to call the API
 */
export async function fetchUserData(userId) {
  try {
    const response = await fetch(`${API_URL}/api/users/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}
