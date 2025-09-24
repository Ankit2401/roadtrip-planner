import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import WeatherWidget from '../components/WeatherWidget';
import { BASE_URL } from '../api';

const MyTripsPage = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyTrips = async () => {
            if (!auth.isAuthenticated) {
                setLoading(false);
                return;
            }
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${BASE_URL}/roadtrips/user/mytrips`, {
                    headers: { 'x-auth-token': token }
                });
                setTrips(response.data || []);
                setError(null);
            } catch (err) {
                console.error("Error fetching my trips:", err);
                setError("Failed to load your trips. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchMyTrips();
    }, [auth.isAuthenticated]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this trip?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${BASE_URL}/roadtrips/${id}`, { headers: { 'x-auth-token': token } });
                setTrips(trips.filter(trip => trip._id !== id));
            } catch (err) {
                console.error("Error deleting trip:", err);
                alert("Failed to delete trip.");
            }
        }
    };

    if (loading) return <div className="text-center mt-10">Loading your trips...</div>;
    if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">My Created Trips</h1>
            {trips.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trips.map(trip => (
                        <div key={trip._id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
                            <div className="p-6 flex-grow">
                                <h2 className="text-xl font-bold text-cars24-blue mb-2">{trip.title}</h2>
                                <p className="text-gray-600 truncate mb-4">{trip.description}</p>
                                <WeatherWidget location={trip.route?.[0]?.locationName} />
                            </div>
                            <div className="p-4 bg-gray-50 flex justify-between items-center">
                                <Link to={`/trips/${trip._id}`} className="text-sm font-medium text-cars24-blue hover:underline">Details</Link>
                                <div>
                                    <Link to={`/edit-trip/${trip._id}`} className="text-sm font-medium text-green-600 hover:text-green-800 mr-3">Edit</Link>
                                    <button onClick={() => handleDelete(trip._id)} className="text-sm font-medium text-red-600 hover:text-red-800">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <p>You haven't created any trips yet.</p>
                    <Link to="/create-trip" className="mt-4 inline-block bg-cars24-accent-orange text-white font-bold py-2 px-4 rounded hover:bg-orange-500">
                        Create Your First Trip!
                    </Link>
                </div>
            )}
        </div>
    );
};

export default MyTripsPage;
