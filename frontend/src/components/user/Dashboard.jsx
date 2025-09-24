import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getMyTrips } from '../../api/tripService';
import { getUserReviews } from '../../api/reviewService';
import LoadingSpinner from '../shared/LoadingSpinner';
import TripCard from '../trips/TripCard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [myTrips, setMyTrips] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('trips');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [tripsData, reviewsData] = await Promise.all([
        getMyTrips(),
        getUserReviews()
      ]);
      setMyTrips(tripsData);
      setMyReviews(reviewsData.reviews || reviewsData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">
          <h2>Dashboard Error</h2>
          <p>{error}</p>
          <button onClick={fetchUserData} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name}!</h1>
        <p>Manage your trips and see your travel activity</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{myTrips.length}</h3>
          <p>Your Trips</p>
        </div>
        <div className="stat-card">
          <h3>{myReviews.length}</h3>
          <p>Your Reviews</p>
        </div>
        <div className="stat-card">
          <h3>{myTrips.reduce((total, trip) => total + (trip.likes?.length || 0), 0)}</h3>
          <p>Total Likes</p>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'trips' ? 'active' : ''}`}
          onClick={() => setActiveTab('trips')}
        >
          My Trips ({myTrips.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          My Reviews ({myReviews.length})
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'trips' && (
          <div className="trips-section">
            <div className="section-header">
              <h2>Your Trips</h2>
              <Link to="/create-trip" className="btn btn-primary">
                Create New Trip
              </Link>
            </div>
            
            {myTrips.length === 0 ? (
              <div className="empty-state">
                <h3>No trips yet</h3>
                <p>Start sharing your amazing road trips with the community!</p>
                <Link to="/create-trip" className="btn btn-primary">
                  Create Your First Trip
                </Link>
              </div>
            ) : (
              <div className="trip-grid">
                {myTrips.map(trip => (
                  <div key={trip._id} className="trip-card-wrapper">
                    <TripCard trip={trip} />
                    <div className="trip-actions">
                      <Link to={`/edit-trip/${trip._id}`} className="btn btn-secondary">
                        Edit
                      </Link>
                      <Link to={`/trips/${trip._id}`} className="btn btn-primary">
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="reviews-section">
            <h2>Your Reviews</h2>
            
            {myReviews.length === 0 ? (
              <div className="empty-state">
                <h3>No reviews yet</h3>
                <p>Share your experiences by reviewing trips you've taken!</p>
                <Link to="/trips" className="btn btn-primary">
                  Explore Trips
                </Link>
              </div>
            ) : (
              <div className="reviews-list">
                {myReviews.map(review => (
                  <div key={review._id} className="review-item">
                    <div className="review-header">
                      <Link to={`/trips/${review.roadTrip._id}`}>
                        <h4>{review.roadTrip.title}</h4>
                      </Link>
                      <div className="review-rating">
                        {'⭐'.repeat(review.rating)}
                      </div>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                    <div className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;