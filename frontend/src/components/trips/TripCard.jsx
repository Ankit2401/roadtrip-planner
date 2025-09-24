import React from 'react';
import { Link } from 'react-router-dom';

const TripCard = ({ trip }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="trip-card">
      <Link to={`/trips/${trip._id}`}>
        <div className="trip-image-container">
          <img 
            src={trip.coverImage || '/placeholder-trip.jpg'} 
            alt={trip.title}
            className="trip-image"
            onError={(e) => {
              e.target.src = '/placeholder-trip.jpg';
            }}
          />
          {trip.isFeatured && (
            <span className="featured-badge">Featured</span>
          )}
        </div>
        
        <div className="trip-card-content">
          <h3 className="trip-title">{trip.title}</h3>
          <p className="trip-description">
            {trip.description.substring(0, 120)}
            {trip.description.length > 120 ? '...' : ''}
          </p>
          
          <div className="trip-meta">
            <div className="trip-stats">
              <span className="trip-likes">
                ❤️ {trip.likes?.length || 0}
              </span>
              <span className="trip-comments">
                💬 {trip.comments?.length || 0}
              </span>
            </div>
            <div className="trip-author">
              By {trip.createdBy?.name || 'Anonymous'}
            </div>
          </div>
          
          <div className="trip-date">
            {formatDate(trip.createdAt)}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default TripCard;