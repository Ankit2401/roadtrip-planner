import React, { useState, useContext } from 'react'; 
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../api'; //

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // const response = await axios.post('/api/auth/login', formData);
            const response = await axios.post(`${BASE_URL}/auth/login`, formData);
            
            login(response.data.token);

            alert('Login successful!');
            navigate('/trips');
        } catch (error) {
            console.error(error.response.data);
            alert(error.response.data.message || 'Login failed.');
        }
    };

    return (
        <div className="container mx-auto mt-10 p-8 max-w-lg shadow-lg rounded-lg bg-white">
            <h1 className="text-2xl font-bold mb-6 text-center">Login to Your Account</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                    <input type="email" name="email" value={email} onChange={onChange} required className="shadow appearance-none border rounded w-full py-2 px-3" />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                    <input type="password" name="password" value={password} onChange={onChange} required className="shadow appearance-none border rounded w-full py-2 px-3" />
                </div>
                <div className="flex items-center justify-center">
                    <button type="submit" className="bg-cars24-blue hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded">
                        Login
                    </button>
                </div>
            </form>
            <p className="text-center text-gray-600 text-sm mt-4">
                Don't have an account? <Link to="/register" className="text-cars24-blue hover:underline">Register here</Link>
            </p>
        </div>
    );
};

export default LoginPage;