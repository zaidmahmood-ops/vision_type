// src/services/api.js
const API_BASE_URL = 'https://vision-type.onrender.com'; // Your FastAPI backend address

export async function apiRequest(endpoint, options = {}) {
  // Automatically pull the token from localStorage if it exists
  const token = localStorage.getItem('auth_token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      // Automatically inject Authorization header if token is present
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      let errorMessage = data.detail;

      // If FastAPI returns an array of validation errors (like 422 Unprocessable Entity)
      if (Array.isArray(data.detail)) {
        errorMessage = data.detail.map(err => `${err.loc[err.loc.length - 1]}: ${err.msg}`).join(', ');
      }

      // FastAPI returns validation errors in data.detail
      throw new Error(errorMessage || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (err) {
    throw new Error(err.message || 'Network error, please try again.');
  }
}