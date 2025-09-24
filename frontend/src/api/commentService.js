import API from './api';

export const getCommentsForTrip = async (tripId, page = 1) => {
  const res = await API.get(`/comments/${tripId}?page=${page}`);
  return res.data;
};

export const createComment = async (tripId, text) => {
  const res = await API.post(`/comments/${tripId}`, { text });
  return res.data;
};

export const updateComment = async (commentId, text) => {
  const res = await API.put(`/comments/${commentId}`, { text });
  return res.data;
};

export const deleteComment = async (commentId) => {
  const res = await API.delete(`/comments/${commentId}`);
  return res.data;
};