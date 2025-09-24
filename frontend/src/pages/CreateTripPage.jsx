import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../api';

const CreateTripPage = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDestination, setStartDestination] = useState('');
    const [finalDestination, setFinalDestination] = useState('');
    const [images, setImages] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        setImages(e.target.files); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!auth.isAuthenticated || !auth.user) {
            alert("You must be logged in to create a trip.");
            return navigate('/login');
        }
        if (!title || !description || !startDestination || !finalDestination) {
            alert('Please fill in all text fields');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('createdBy', auth.user.id);
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
            await axios.post(`${BASE_URL}/roadtrips`, formData, config);
            setIsSuccess(true);
        } catch (error) {
            console.error('Error creating trip:', error);
            alert('Failed to create trip.');
        }
    };

    if (isSuccess) {
       return (
            <div className="text-center p-16 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-green-600 mb-4">Trip Created Successfully!</h2>
                <Link to="/trips" className="bg-cars24-blue text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-90">
                    Go to Your Trips
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto mt-10 p-8 max-w-lg shadow-lg rounded-lg bg-white relative">
            <h1 className="text-2xl font-bold mb-6 text-center">Create a New Road Trip</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title</label>
                    <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="start" className="block text-gray-700 text-sm font-bold mb-2">Start Destination</label>
                        <input id="start" type="text" placeholder="e.g., Delhi" value={startDestination} onChange={(e) => setStartDestination(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                    </div>
                    <div>
                        <label htmlFor="final" className="block text-gray-700 text-sm font-bold mb-2">Final Destination</label>
                        <input id="final" type="text" placeholder="e.g., Agra" value={finalDestination} onChange={(e) => setFinalDestination(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                    </div>
                </div>
                <div className="mb-4">
                    <label htmlFor="coverImage" className="block text-gray-700 text-sm font-bold mb-2">Images (Optional, up to 5)</label>
                    <input 
                        id="coverImage" 
                        type="file" 
                        multiple 
                        onChange={handleImageChange} 
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-cars24-blue hover:file:bg-blue-100"
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                    <textarea id="description" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                </div>
                <div className="flex items-center justify-center">
                    <button type="submit" className="bg-cars24-accent-orange text-white font-bold py-2 px-4 rounded hover:bg-orange-500">
                        Publish Trip
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateTripPage;