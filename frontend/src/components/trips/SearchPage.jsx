import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../../api/api';
import './Trip.css';

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!query) {
                setResults([]);
                return;
            }
            
            setLoading(true);
            setError(null);
            
            try {
                const res = await API.get(`/roadtrips/search?q=${encodeURIComponent(query)}`);
                setResults(res.data);
            } catch (err) {
                setError('Failed to perform search. Please try again.');
                console.error('Search error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [query]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchParams({ q: query });
    };

    return (
        <div className="container">
            <h2>Search Road Trips</h2>
            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by title, description, or location..."
                    className="search-input"
                />
                <button type="submit" className="btn btn-primary">Search</button>
            </form>

            {loading && <div className="loading-spinner">Searching...</div>}
            {error && <p className="alert alert-danger">{error}</p>}
            
            {!loading && !error && (
                <div className="search-results">
                    {results.length > 0 ? (
                        <div className="trip-grid">
                            {results.map(trip => (
                                <div key={trip._id} className="trip-card">
                                    <Link to={`/trips/${trip._id}`}>
                                        <img src={trip.coverImage} alt={trip.title} className="trip-image" />
                                        <div className="trip-card-content">
                                            <h4 className="trip-title">{trip.title}</h4>
                                            <p className="trip-description">{trip.description.substring(0, 100)}...</p>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No trips found matching your search.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchPage;