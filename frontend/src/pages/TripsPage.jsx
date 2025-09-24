import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import WeatherWidget from '../components/WeatherWidget';
import { BASE_URL } from '../api';
import axios from 'axios';

const TripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchTrips = async () => {
    try {
      console.log('Fetching trips from:', `${BASE_URL}/roadtrips`);
      const response = await axios.get(`${BASE_URL}/roadtrips`);
      setTrips(response.data.trips || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDelete = async (id) => {
    if (!auth.isAuthenticated) return navigate('/login');

    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${BASE_URL}/roadtrips/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setTrips(trips.filter((trip) => trip._id !== id));
      } catch (error) {
        console.error('Error deleting trip:', error);
        alert('Failed to delete trip.');
      }
    }
  };

  const handleLike = async (id) => {
    if (!auth.isAuthenticated) return navigate('/login');

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.put(`${BASE_URL}/roadtrips/${id}/like`, null, config);

      const updatedTrips = trips.map((trip) =>
        trip._id === id ? { ...trip, likes: res.data } : trip
      );
      setTrips(updatedTrips);
    } catch (err) {
      console.error('Error liking trip:', err);
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading trips...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Explore Road Trips</h1>
      {trips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips
            .filter((trip) => trip.createdBy?._id !== auth.user?.id)
            .map((trip) => {
              const userLiked = Array.isArray(trip.likes) && auth.user
                ? trip.likes.includes(auth.user.id)
                : false;

              const likeCount = Array.isArray(trip.likes) ? trip.likes.length : 0;

              return (
                <div key={trip._id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
                  <img
                    src={trip.coverImage || 'https://via.placeholder.com/400x200'}
                    alt={trip.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6 flex-grow">
                    <h2 className="text-xl font-bold text-cars24-blue mb-2">{trip.title}</h2>
                    <p className="text-gray-600 truncate mb-4">{trip.description}</p>
                    {Array.isArray(trip.route) && trip.route.length > 0 && (
                      <WeatherWidget location={trip.route[0]?.locationName} />
                    )}
                  </div>
                  <div className="p-4 bg-gray-50 flex justify-between items-center">
                    <button
                      onClick={() => handleLike(trip._id)}
                      className="flex items-center text-gray-600 hover:text-red-500 transition-colors duration-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 mr-1"
                        fill={userLiked ? 'rgb(239 68 68)' : 'none'}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
                        />
                      </svg>
                      <span className="font-semibold text-sm">{likeCount}</span>
                    </button>
                    <div className="flex items-center">
                      <Link
                        to={`/trips/${trip._id}`}
                        className="text-sm font-medium text-cars24-blue hover:underline mr-3"
                      >
                        Details
                      </Link>
                      {auth.isAuthenticated && trip.createdBy && trip.createdBy._id === auth.user.id && (
                        <>
                          <Link
                            to={`/edit-trip/${trip._id}`}
                            className="text-sm font-medium text-green-600 hover:text-green-800 mr-3"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(trip._id)}
                            className="text-sm font-medium text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p>No trips found. Be the first to create one!</p>
        </div>
      )}
    </div>
  );
};

export default TripsPage;
