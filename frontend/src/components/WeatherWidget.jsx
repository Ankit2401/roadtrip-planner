import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../api';


const WeatherWidget = ({ location }) => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (location) {
            const fetchWeather = async () => {
                try {
                    setLoading(true);
                    
                    const response = await axios.get(`${BASE_URL}/weather?location=${location}`);
                    setWeather(response.data);
                    setLoading(false);
                } catch (error) {
                    console.error("Error fetching weather:", error);
                    setWeather(null);
                    setLoading(false);
                }
            };
            fetchWeather();
        }
    }, [location]); 

    if (!location) return null; 
    if (loading) return <div>Loading weather...</div>;
    if (!weather) return <div>Could not fetch weather.</div>;

    return (
        <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
            <img src={weather.icon} alt={weather.condition} className="w-16 h-16 mr-4" />
            <div>
                <p className="text-xl font-bold text-gray-800">{weather.location}</p>
                <p className="text-3xl font-bold text-cars24-blue">{weather.temp_c}°C</p>
                <p className="text-gray-600">{weather.condition}</p>
            </div>
        </div>
    );
};

export default WeatherWidget;