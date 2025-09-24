import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTripById, updateTrip } from '../../api/tripService';
import { AuthContext } from '../../context/AuthContext';
import './Trip.css';

const EditTrip = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        images: null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const tripData = await getTripById(id);
                if (tripData.createdBy._id !== user.id) {
                    navigate('/dashboard'); // Redirect if not the owner
                    return;
                }
                setFormData({
                    title: tripData.title,
                    description: tripData.description,
                    images: null,
                });
            } catch (err) {
                setError('Failed to load trip data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchTrip();
        }
    }, [id, user, navigate]);

    const onChange = (e) => {
        if (e.target.name === 'images') {
            setFormData({ ...formData, images: e.target.files });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formPayload = new FormData();
        formPayload.append('title', formData.title);
        formPayload.append('description', formData.description);
        
        if (formData.images) {
            for (const file of formData.images) {
                formPayload.append('images', file);
            }
        }

        try {
            await updateTrip(id, formPayload);
            navigate(`/trips/${id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update trip.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading-spinner">Loading trip for editing...</div>;
    }

    if (error) {
        return <div className="container"><p className="alert alert-danger">{error}</p></div>;
    }

    return (
        <div className="container create-trip-container">
            <h2>Edit Road Trip</h2>
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
                    <label htmlFor="images">Update Images (optional)</label>
                    <input type="file" id="images" name="images" multiple onChange={onChange} accept="image/*" />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Trip'}
                </button>
            </form>
        </div>
    );
};

export default EditTrip;