import React, { useState, useEffect } from 'react';
import { getNearbyPlaces } from '../../api/placesService';

const PlacesWidget = ({ location }) => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location) {
      fetchPlaces();
    }
  }, [location]);

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const placesData = await getNearbyPlaces(location);
      setPlaces(placesData.places || []);
    } catch (err) {
      setError('Failed to load nearby places');
      console.error('Places error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!location) return null;

  if (loading) {
    return (
      <div className="places-widget loading">
        <h4>Nearby Places</h4>
        <p>Finding places near {location}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="places-widget error">
        <h4>Nearby Places</h4>
        <p>{error}</p>
        <button onClick={fetchPlaces} className="btn-small">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="places-widget">
      <h4>Nearby Places</h4>
      {places.length === 0 ? (
        <p>No places found near {location}</p>
      ) : (
        <div className="places-list">
          {places.slice(0, 5).map((place, index) => (
            <div key={place.id || index} className="place-item">
              <div className="place-info">
                <strong>{place.name}</strong>
                {place.address && <div className="place-address">{place.address}</div>}
                <div className="place-category">{place.category}</div>
              </div>
              {place.distance && (
                <div className="place-distance">
                  {Math.round(place.distance)}m away
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlacesWidget;