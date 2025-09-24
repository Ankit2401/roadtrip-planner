import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { BASE_URL } from '../api';

const EditTripPage = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDestination, setStartDestination] = useState('');
    const [finalDestination, setFinalDestination] = useState('');
    const [images, setImages] = useState(null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/roadtrips/${id}`);
                const { title, description, route } = response.data;
                setTitle(title);
                setDescription(description);
                if (route && route.length >= 2) {
                    setStartDestination(route[0].locationName);
                    setFinalDestination(route[1].locationName);
                }
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch trip data:", error);
                setLoading(false);
            }
        };
        fetchTrip();
    }, [id]);

    const handleImageChange = (e) => {
        setImages(e.target.files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        const route = [
            { locationName: startDestination, description: "Starting Point" },
            { locationName: finalDestination, description: "Final Destination" }
        ];
        formData.append('route', JSON.stringify(route));
        
        if (images) {
            for (let i = 0; i < images.length; i++) {
                formData.append('images', images[i]);
            }
        }

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'x-auth-token': token
                }
            };
            
            await axios.put(`${BASE_URL}/roadtrips/${id}`, formData, config);
            alert('Trip updated successfully!');
            window.location.href = '/trips';
        } catch (error) {
            console.error('Error updating trip:', error);
            alert('Failed to update trip.');
        }
    };

    if (loading) {
        return <div>Loading trip details...</div>;
    }

    return (
        <div className="container mx-auto mt-10 p-8 max-w-lg shadow-lg rounded-lg bg-white relative">
            <button onClick={() => navigate(-1)} className="absolute top-4 left-4 text-cars24-blue hover:underline">
                ← Back
            </button>
            <h1 className="text-2xl font-bold mb-6 text-center">Edit Your Road Trip</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title</label>
                    <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="start" className="block text-gray-700 text-sm font-bold mb-2">Start Destination</label>
                        <input id="start" type="text" value={startDestination} onChange={(e) => setStartDestination(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                    </div>
                    <div>
                        <label htmlFor="final" className="block text-gray-700 text-sm font-bold mb-2">Final Destination</label>
                        <input id="final" type="text" value={finalDestination} onChange={(e) => setFinalDestination(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                    </div>
                </div>
                 <div className="mb-4">
                    <label htmlFor="images" className="block text-gray-700 text-sm font-bold mb-2">Upload New Images (Optional)</label>
                    <input 
                        id="images" 
                        type="file" 
                        multiple 
                        onChange={handleImageChange} 
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0"
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                    <textarea id="description" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                </div>
                <div className="flex items-center justify-center">
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                        Update Trip
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditTripPage;