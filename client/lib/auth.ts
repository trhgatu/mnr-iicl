import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

const TOKEN_KEY = 'iicl_token';

/**
 * Logs in the user and stores the token.
 * @param email The user's email.
 * @param password The user's password.
 * @returns The JWT token.
 */
export const login = async (email, password) => {
  try {
    const { data } = await apiClient.post('/auth/login', { email, password });
    if (data.success && data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      return data.token;
    } else {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'An error occurred during login.');
    }
    throw error;
  }
};

/**
 * Logs out the user by removing the token.
 */
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Retrieves the stored JWT token.
 * @returns The JWT token or null if it doesn't exist.
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Sets up Axios interceptors to automatically add the Authorization header.
 */
export const setupInterceptors = () => {
  apiClient.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

// Also, we need to export the apiClient to be used by other api calls.
// The previous `api.ts` file should be refactored to use this client.
// For now, I'll just export it.
export { apiClient };
