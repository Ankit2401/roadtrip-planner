import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import WeatherWidget from '../components/WeatherWidget';
import MapComponent from '../components/MapComponent';
import SimpleImageViewer from 'react-simple-image-viewer';
import { BASE_URL } from '../api';

const TripDetailPage = () => {
    const [trip, setTrip] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [routeData, setRouteData] = useState(null);
    const [places, setPlaces] = useState([]);
    const [currentImage, setCurrentImage] = useState(0);
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    const { id } = useParams();
    const navigate = useNavigate();
    const { auth } = useContext(AuthContext);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'x-auth-token': token } };

                const [tripRes, commentsRes] = await Promise.all([
                    axios.get(`${BASE_URL}/roadtrips/${id}`),
                    axios.get(`${BASE_URL}/comments/${id}`)
                ]);

                setTrip(tripRes.data || {});
                const commentsData = Array.isArray(commentsRes.data) ? commentsRes.data : commentsRes.data.comments || [];
                setComments(commentsData);

                if (token && tripRes.data.route?.length >= 2) {
                    const startDest = tripRes.data.route[0].locationName;
                    const finalDest = tripRes.data.route[1].locationName;

                    axios.post(`${BASE_URL}/route`, { startLocationName: startDest, endLocationName: finalDest }, config)
                        .then(res => setRouteData(res.data))
                        .catch(err => console.error("Error fetching route:", err));

                    axios.get(`${BASE_URL}/places?location=${finalDest}`, config)
                        .then(res => setPlaces(res.data))
                        .catch(err => console.error("Error fetching places:", err));
                }
            } catch (error) {
                console.error("Error fetching main details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            const res = await axios.post(`${BASE_URL}/comments/${id}`, { text: newComment }, config);
            const populatedComment = { ...res.data, user: { username: auth.user?.username || 'User' } };
            setComments([populatedComment, ...comments]);
            setNewComment('');
        } catch (err) {
            console.error("Error posting comment:", err);
        }
    };

    const openImageViewer = useCallback((index) => {
        setCurrentImage(index);
        setIsViewerOpen(true);
    }, []);

    const closeImageViewer = () => {
        setCurrentImage(0);
        setIsViewerOpen(false);
    };

    if (loading) return <div>Loading details...</div>;
    if (!trip) return <div>Trip not found.</div>;

    const startDest = trip.route?.[0]?.locationName;
    const finalDest = trip.route?.[1]?.locationName;

    return (
        <div className="container mx-auto p-4">
            <button onClick={() => navigate(-1)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-300 mb-6">
                ← Back
            </button>
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <h1 className="text-4xl font-bold text-cars24-blue mb-4">{trip.title}</h1>
                        <p className="text-gray-600 mb-8">{trip.description}</p>
                        
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Route Details</h2>
                        {routeData ? (
                            <>
                                <div className="bg-gray-100 p-4 rounded-lg mb-4 flex justify-around text-center">
                                    <div><p className="font-bold">Distance</p><p>~ {routeData.distance} km</p></div>
                                    <div><p className="font-bold">Duration</p><p>~ {routeData.duration} hrs</p></div>
                                </div>
                                <MapComponent routeData={routeData} />
                            </>
                        ) : (<p className="text-gray-500">Login to view the route map.</p>)}
                    </div>

                    <div className="md:col-span-1">
                        {trip.coverImage && <img src={trip.coverImage} alt={trip.title} className="w-full h-auto object-cover rounded-lg shadow-md mb-8" />}
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Weather Forecast</h2>
                        <div className="space-y-4">
                            {startDest && <WeatherWidget location={startDest} />}
                            {finalDest && <WeatherWidget location={finalDest} />}
                        </div>
                    </div>
                </div>

                {trip.images?.length > 0 && (
                    <>
                        <hr className="my-8" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Gallery</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {trip.images.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt={`Trip image ${idx + 1}`}
                                    onClick={() => openImageViewer(idx)}
                                    className="w-full h-32 object-cover cursor-pointer rounded"
                                />
                            ))}
                        </div>
                        {isViewerOpen && (
                            <SimpleImageViewer
                                src={trip.images}
                                currentIndex={currentImage}
                                onClose={closeImageViewer}
                            />
                        )}
                    </>
                )}

                <hr className="my-8" />
                <h2 className="text-2xl font-bold mb-4">Comments</h2>
                {auth.isAuthenticated ? (
                    <form onSubmit={handleCommentSubmit} className="mb-6">
                        <textarea
                            className="w-full border rounded p-2 mb-2"
                            rows={3}
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <button type="submit" className="bg-cars24-accent-orange text-white py-2 px-4 rounded hover:bg-orange-500">Post Comment</button>
                    </form>
                ) : (
                    <p className="text-gray-500">Login to post a comment.</p>
                )}

                {comments.length > 0 ? (
                    <div className="space-y-4">
                        {comments.map((c, idx) => (
                            <div key={idx} className="border p-4 rounded-lg bg-gray-50">
                                <p className="font-semibold">{c.user?.username || 'User'}</p>
                                <p>{c.text || c.comment}</p>
                            </div>
                        ))}
                    </div>
                ) : <p>No comments yet.</p>}
            </div>
        </div>
    );
};

export default TripDetailPage;
