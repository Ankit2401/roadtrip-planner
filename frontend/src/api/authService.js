import API, { setAuthToken } from './api';

export const register = async (userData) => {
  try {
    const res = await API.post('/auth/register', userData);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const login = async (credentials) => {
  try {
    const res = await API.post('/auth/login', credentials);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      setAuthToken(res.data.token);
    }
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getProfile = async () => {
  try {
    const res = await API.get('/auth/profile');
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  setAuthToken(null);
};