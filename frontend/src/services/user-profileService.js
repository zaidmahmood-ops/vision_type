// user-profileService.js
import { apiRequest } from './api.js';

export async function fetchUserProfile(username = null) {
  try {
    // If no username is provided as an argument, look it up from localStorage
    const targetUsername = username || localStorage.getItem('visiontype_username') || 'TestUser';

    const data = await apiRequest(`/api/users/${targetUsername}/profile`, {
      method: 'GET'
    });

    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}