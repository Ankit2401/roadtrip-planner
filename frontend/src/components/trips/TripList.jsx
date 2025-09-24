import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllTrips } from '../../api/tripService';
import LoadingSpinner from '../shared/LoadingSpinner';
import Pagination from '../shared/Pagination';
import TripCard from './TripCard';
import './Trip.css';

const TripList = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTrips, setTotalTrips] = useState(0);

  const fetchTrips = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllTrips(page, 12);
      setTrips(data.trips);
      setCurrentPage(data.pagination.currentPage);
      setTotalPages(data.pagination.totalPages);
      setTotalTrips(data.pagination.totalTrips);
    } catch (err) {
      setError('Failed to load trips. Please try again.');
      console.error('Error fetching trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handlePageChange = (page) => {
    fetchTrips(page);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return <LoadingSpinner message="Loading trips..." />;
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">
          <h2>Error Loading Trips</h2>
          <p>{error}</p>
          <button onClick={() => fetchTrips()} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="trip-list-header">
        <h1>Discover Amazing Road Trips</h1>
        <p>Explore {totalTrips} incredible journeys shared by our community</p>
        <Link to="/create-trip" className="btn btn-primary">
          Share Your Trip
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="empty-state">
          <h3>No trips found</h3>
          <p>Be the first to share an amazing road trip!</p>
          <Link to="/create-trip" className="btn btn-primary">
            Create First Trip
          </Link>
        </div>
      ) : (
        <>
          <div className="trip-grid">
            {trips.map(trip => (
              <TripCard key={trip._id} trip={trip} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default TripList;