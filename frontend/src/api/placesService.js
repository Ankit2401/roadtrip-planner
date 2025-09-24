import API from './api';

export const getNearbyPlaces = async (location, radius = 5000, limit = 6) => {
  try {
    const res = await API.get('/places', {
      params: { location, radius, limit }
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};