import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTrip } from '../../api/tripService';
import { AuthContext } from '../../context/AuthContext';
import './Trip.css';

const CreateTrip = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    images: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const onChange = (e) => {
    if (e.target.name === 'images') {
      setFormData({ ...formData, images: e.target.files });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to create a trip.');
      return;
    }

    setLoading(true);
    setError('');

    const formPayload = new FormData();
    formPayload.append('title', formData.title);
    formPayload.append('description', formData.description);
    formPayload.append('createdBy', user._id);
    
    if (formData.images) {
      for (const file of formData.images) {
        formPayload.append('images', file);
      }
    }

    try {
      await createTrip(formPayload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create trip.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container create-trip-container">
      <h2>Create a New Road Trip</h2>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="title">Trip Title</label>
          <input type="text" id="title" name="title" value={formData.title} onChange={onChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" value={formData.description} onChange={onChange} required rows="5"></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="images">Trip Images</label>
          <input type="file" id="images" name="images" multiple onChange={onChange} accept="image/*" />
        </div>
        {error && <p className="alert alert-danger">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Trip'}
        </button>
      </form>
    </div>
  );
};

export default CreateTrip;