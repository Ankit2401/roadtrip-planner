import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} Road Trip Planner. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;