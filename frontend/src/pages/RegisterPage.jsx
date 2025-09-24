import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { BASE_URL } from '../api';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
    });
    const navigate = useNavigate();

    const { name, username, email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${BASE_URL}/auth/register`, formData);
            alert('Registration successful! Please log in.');
            navigate('/login');
        } catch (error) {
            console.error(error.response.data);
            alert(error.response.data.message || 'Registration failed.');
        }
    };

    return (
        <div className="container mx-auto mt-10 p-8 max-w-lg shadow-lg rounded-lg bg-white">
            <h1 className="text-2xl font-bold mb-6 text-center">Create Your Account</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                    <input type="text" name="name" value={name} onChange={onChange} required className="shadow appearance-none border rounded w-full py-2 px-3" />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
                    <input type="text" name="username" value={username} onChange={onChange} required className="shadow appearance-none border rounded w-full py-2 px-3" />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                    <input type="email" name="email" value={email} onChange={onChange} required className="shadow appearance-none border rounded w-full py-2 px-3" />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                    <input type="password" name="password" value={password} onChange={onChange} required minLength="6" className="shadow appearance-none border rounded w-full py-2 px-3" />
                </div>
                <div className="flex items-center justify-center">
                    <button type="submit" className="bg-cars24-blue hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded">
                        Register
                    </button>
                </div>
            </form>
            <p className="text-center text-gray-600 text-sm mt-4">
                Already have an account? <Link to="/login" className="text-cars24-blue hover:underline">Login here</Link>
            </p>
        </div>
    );
};

export default RegisterPage;