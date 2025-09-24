import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="relative w-full h-screen flex items-center overflow-hidden">

      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/background-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Vibrant Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/40 via-pink-400/30 to-purple-600/40 z-10 backdrop-blur-sm"></div>

      {/* Main Content */}
      <div className="relative z-20 flex flex-col md:flex-row items-start justify-center h-full px-6 md:px-20 lg:px-32">
        {/* Left Side: Text */}
        <div className="text-left md:w-1/2 flex flex-col justify-center h-full">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white drop-shadow-2xl mb-6 animate-fade-in">
            Road Trip Planner
          </h1>
          <p className="text-lg md:text-2xl text-white/90 mb-8 max-w-lg drop-shadow-lg animate-fade-in delay-200">
            Discover, plan, and share your next great adventure. Explore exciting destinations and make memories that last a lifetime.
          </p>
          <Link
            to="/trips"
            className="inline-block bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white font-semibold py-4 px-10 rounded-xl shadow-xl hover:scale-105 transform transition-all duration-300 animate-bounce"
          >
            Explore Trips
          </Link>
        </div>

        {/* Right Side: Decorative Shapes */}
        <div className="hidden md:flex md:w-1/2 relative justify-center items-center">
          <div className="absolute w-40 h-40 bg-pink-400 rounded-full opacity-50 animate-pulse -top-20 -left-10"></div>
          <div className="absolute w-60 h-60 bg-purple-500 rounded-full opacity-30 animate-pulse top-32 right-10"></div>
          <div className="absolute w-32 h-32 bg-yellow-400 rounded-full opacity-40 animate-pulse bottom-20 right-32"></div>
        </div>
      </div>

      {/* Tailwind Animations */}
      <style>
        {`
          @keyframes fade-in {
            0% { opacity: 0; transform: translateY(-20px);}
            100% { opacity: 1; transform: translateY(0);}
          }
          .animate-fade-in {
            animation: fade-in 1s ease forwards;
          }
          .delay-200 {
            animation-delay: 0.2s;
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          .animate-bounce {
            animation: bounce 2s infinite;
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.4; }
            50% { transform: scale(1.2); opacity: 0.6; }
          }
          .animate-pulse {
            animation: pulse 3s infinite;
          }
        `}
      </style>
    </div>
  );
};

export default HomePage;
