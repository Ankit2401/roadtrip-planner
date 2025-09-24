import React, { useContext } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from 'react-router-dom';
import { AuthContext } from './context/AuthContext';


import HomePage from './pages/HomePage';
import TripsPage from './pages/TripsPage';
import CreateTripPage from './pages/CreateTripPage';
import TripDetailPage from './pages/TripDetailPage';
import EditTripPage from './pages/EditTripPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute';
import MyTripsPage from './pages/MyTripsPage';

const LogoutButton = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); 
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600"
    >
      Logout
    </button>
  );
};

function App() {
  const { auth } = useContext(AuthContext);

  return (
    <div className="bg-cars24-secondary min-h-screen">
      <nav className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-cars24-blue">
            RoadTrip Planner
          </Link>

          <div>
            <Link to="/" className="text-gray-700 hover:text-cars24-blue mr-4">
              Home
            </Link>
            <Link
              to="/trips"
              className="text-gray-700 hover:text-cars24-blue mr-4"
            >
              Explore Trips
            </Link>
            
            {auth.isAuthenticated && (
              <>
               <Link to="/mytrips" className="text-gray-700 hover:text-cars24-blue mr-4">My Trips</Link>
              <Link
                to="/create-trip"
                className="text-gray-700 hover:text-cars24-blue mr-4"
              >
                Create Trip
              </Link>
              </>
            )}
          </div>

          <div>
            {auth.isAuthenticated ? (
              <LogoutButton />
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-cars24-blue mr-4"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-cars24-accent-orange text-white font-bold py-2 px-4 rounded hover:bg-orange-500"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-4">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Private Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/create-trip" element={<CreateTripPage />} />
            <Route path="/edit-trip/:id" element={<EditTripPage />} />
            <Route path="/trips/:id" element={<TripDetailPage />} />
            <Route path="/mytrips" element={<MyTripsPage />} /> 
          </Route>
        </Routes>
      </main>
    </div>
  );
}


export default App;
