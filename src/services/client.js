const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.example.com/v1';

/**
 * Base HTTP Client for making API requests with standard headers & handling
 */
export async function httpClient(endpoint, { body, customHeaders = {}, ...customConfig } = {}) {
  const headers = { 'Content-Type': 'application/json', ...customHeaders };
  
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();
    if (response.ok) {
      return data;
    }
    throw new Error(data.message || 'Something went wrong');
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}
