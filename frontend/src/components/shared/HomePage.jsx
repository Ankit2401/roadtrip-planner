import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="homepage-container">
      <div className="hero-section">
        <h1 className="hero-title">Plan Your Next Great American Road Trip</h1>
        <p className="hero-subtitle">
          Discover, create, and share amazing road trip itineraries. Connect with fellow travelers and explore the open road.
        </p>
        <div className="hero-buttons">
          <Link to="/trips" className="btn btn-primary btn-lg">Explore Trips</Link>
          <Link to="/register" className="btn btn-secondary btn-lg">Join the Community</Link>
        </div>
      </div>
      
      <div className="features-section">
        <h2 className="section-title">Why Road Trip Planner?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3 className="feature-title">Detailed Itineraries</h3>
            <p className="feature-description">
              Find comprehensive routes, including stops, attractions, and estimated durations.
            </p>
          </div>
          <div className="feature-card">
            <h3 className="feature-title">Connect with Travelers</h3>
            <p className="feature-description">
              Comment, review, and follow other users to share your passion for travel.
            </p>
          </div>
          <div className="feature-card">
            <h3 className="feature-title">Plan and Save Your Trips</h3>
            <p className="feature-description">
              Save your favorite trips and create your own custom routes and plans.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;