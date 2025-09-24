import API from './api';

export const getAllTrips = async (page = 1, limit = 12) => {
  const res = await API.get(`/roadtrips?page=${page}&limit=${limit}`);
  return res.data;
};

export const getTripById = async (id) => {
  const res = await API.get(`/roadtrips/${id}`);
  return res.data;
};

export const createTrip = async (tripData, token) => {
  const res = await API.post('/roadtrips', tripData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      
    },
  });
  return res.data;
};

// New function to update a trip
export const updateTrip = async (id, tripData) => {
    const res = await API.put(`/roadtrips/${id}`, tripData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
        },
    });
    return res.data;
};

export const getMyTrips = async () => {
  const res = await API.get('/roadtrips/user/mytrips');
  return res.data;

};

export const likeTrip = async (id) => {
  const res = await API.put(`/roadtrips/${id}/like`);
  return res.data;
};