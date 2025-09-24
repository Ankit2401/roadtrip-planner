import React, { useState, useEffect } from 'react';
import { getWeatherByLocation } from '../../api/weatherService';

const WeatherWidget = ({ location }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location) {
      fetchWeather();
    }
  }, [location]);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      const weatherData = await getWeatherByLocation(location);
      setWeather(weatherData);
    } catch (err) {
      setError('Failed to load weather data');
      console.error('Weather error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!location) return null;

  if (loading) {
    return (
      <div className="weather-widget loading">
        <h4>Weather</h4>
        <p>Loading weather for {location}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-widget error">
        <h4>Weather</h4>
        <p>{error}</p>
        <button onClick={fetchWeather} className="btn-small">
          Try Again
        </button>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="weather-widget">
      <h4>Current Weather</h4>
      <div className="weather-info">
        <div className="weather-location">
          <strong>{weather.location}</strong>
          {weather.region && `, ${weather.region}`}
        </div>
        <div className="weather-details">
          <div className="weather-temp">
            <span className="temp">{Math.round(weather.temp_c)}°C</span>
            <span className="condition">{weather.condition}</span>
          </div>
          {weather.icon && (
            <img 
              src={`https:${weather.icon}`} 
              alt={weather.condition}
              className="weather-icon"
            />
          )}
        </div>
        <div className="weather-extra">
          <span>Feels like {Math.round(weather.feels_like_c)}°C</span>
          <span>Humidity {weather.humidity}%</span>
          <span>Wind {Math.round(weather.wind_kph)} km/h</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;