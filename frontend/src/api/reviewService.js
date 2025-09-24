import API from './api';

export const createReview = async (tripId, reviewData) => {
  const res = await API.post(`/reviews/${tripId}`, reviewData);
  return res.data;
};

export const getReviewsForTrip = async (tripId) => {
  const res = await API.get(`/reviews/trip/${tripId}`);
  return res.data;
};

// New function to get reviews for the logged-in user
export const getUserReviews = async () => {
    const res = await API.get('/reviews/user/myreviews');
    return res.data;
};

export const updateReview = async (reviewId, reviewData) => {
  const res = await API.put(`/reviews/${reviewId}`, reviewData);
  return res.data;
};

export const deleteReview = async (reviewId) => {
  const res = await API.delete(`/reviews/${reviewId}`);
  return res.data;
};