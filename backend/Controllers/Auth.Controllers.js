const User = require('../Models/User.Models.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Enhanced input validation helper
const validateFields = (fields) => {
    for (const [key, value] of Object.entries(fields)) {
        if (!value || String(value).trim() === '') {
            return { isValid: false, message: `${key.charAt(0).toUpperCase() + key.slice(1)} is required` };
        }
    }
    return { isValid: true };
};

// User Registration
exports.register = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        const validation = validateFields({ name, username, email, password });
        if (!validation.isValid) {
            return res.status(400).json({ message: validation.message });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.toLowerCase())) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const normalizedUsername = username.toLowerCase().trim();

        const existingUser = await User.findOne({
            $or: [{ email: normalizedEmail }, { username: normalizedUsername }]
        });

        if (existingUser) {
            const field = existingUser.email === normalizedEmail ? 'Email' : 'Username';
            return res.status(409).json({ message: `${field} already exists` });
        }

        const saltRounds = 12;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name: name.trim(),
            username: normalizedUsername,
            email: normalizedEmail,
            password: hashedPassword,
        });

        await newUser.save();

        const jwtPayload = { user: { id: newUser.id } };
        const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '7d' });

        return res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                username: newUser.username,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error('Registration error:', error.message);
        return res.status(500).json({ message: 'Server error during registration' });
    }
};

// User Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const validation = validateFields({ email, password });
        if (!validation.isValid) {
            return res.status(400).json({ message: validation.message });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const jwtPayload = { user: { id: user.id } };
        const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '7d' });

        return res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error.message);
        return res.status(500).json({ message: 'Server error during login' });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const userProfile = await User.findById(req.user.id).select('-password');
        if (!userProfile) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json(userProfile);
    } catch (error) {
        console.error('Get profile error:', error.message);
        return res.status(500).json({ message: 'Server error' });
    }
};