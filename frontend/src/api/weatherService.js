import API from './api';

export const getWeatherByLocation = async (location) => {
  try {
    const res = await API.get(`/weather?location=${encodeURIComponent(location)}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getWeatherForecast = async (location, days = 3) => {
  try {
    const res = await API.get(`/weather/forecast?location=${encodeURIComponent(location)}&days=${days}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};