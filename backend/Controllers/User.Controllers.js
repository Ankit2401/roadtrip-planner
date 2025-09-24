const User = require('../Models/User.models');
const bcrypt = require('bcryptjs');

// Helper function for consistent server error responses
const handleServerError = (res, err, message) => {
    console.error(`${message}:`, err.message);
    res.status(500).json({ message, error: err.message });
};

// Input validation helper
const validateUserInput = (data, isUpdate = false) => {
    const { name, username, email, password } = data;

    const nameLength = name?.trim().length;
    const usernameLength = username?.trim().length;
    const passwordLength = password?.length;
    const emailIsValid = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isUpdate) {
        if (!nameLength || nameLength < 2) return { isValid: false, message: 'Name must be at least 2 characters long.' };
        if (!usernameLength || usernameLength < 3) return { isValid: false, message: 'Username must be at least 3 characters long.' };
        if (!emailIsValid) return { isValid: false, message: 'Please enter a valid email address.' };
        if (!passwordLength || passwordLength < 6) return { isValid: false, message: 'Password must be at least 6 characters long.' };
    } else {
        if (nameLength && nameLength < 2) return { isValid: false, message: 'Name must be at least 2 characters long.' };
        if (usernameLength && usernameLength < 3) return { isValid: false, message: 'Username must be at least 3 characters long.' };
        if (email && !emailIsValid) return { isValid: false, message: 'Please enter a valid email address.' };
        if (passwordLength && passwordLength < 6) return { isValid: false, message: 'Password must be at least 6 characters long.' };
    }

    return { isValid: true };
};

// CREATE a new user (Signup)
exports.createUser = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        const validation = validateUserInput(req.body);
        if (!validation.isValid) {
            return res.status(400).json({ message: validation.message });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const normalizedUsername = username.toLowerCase().trim();

        const existingUser = await User.findOne({
            $or: [{ email: normalizedEmail }, { username: normalizedUsername }]
        });

        if (existingUser) {
            const field = existingUser.email === normalizedEmail ? 'Email' : 'Username';
            return res.status(409).json({ message: `${field} already exists.` });
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name: name.trim(),
            username: normalizedUsername,
            email: normalizedEmail,
            password: hashedPassword
        });

        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json(userResponse);
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(409).json({ message: `${field} already exists.` });
        }
        handleServerError(res, error, 'Error creating user');
    }
};

// READ all users with pagination
exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [users, totalCount] = await Promise.all([
            User.find()
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments()
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        res.status(200).json({
            users,
            pagination: {
                currentPage: page,
                totalPages,
                totalUsers: totalCount,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            }
        });
    } catch (error) {
        handleServerError(res, error, 'Error fetching users');
    }
};

// UPDATE a user by ID
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        const validation = validateUserInput(updateData, true);
        if (!validation.isValid) {
            return res.status(400).json({ message: validation.message });
        }
        
        const existingUser = await User.findById(id);
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (updateData.password) {
            const salt = await bcrypt.genSalt(12);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        // Apply normalization for string fields
        if (updateData.email) updateData.email = updateData.email.toLowerCase().trim();
        if (updateData.username) updateData.username = updateData.username.toLowerCase().trim();
        if (updateData.name) updateData.name = updateData.name.trim();

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json(updatedUser);
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(409).json({ message: `${field} already exists.` });
        }
        handleServerError(res, error, 'Error updating user');
    }
};

// DELETE a user by ID
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(204).send();
    } catch (error) {
        handleServerError(res, error, 'Error deleting user');
    }
};

// GET user profile
exports.getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id)
            .select('-password')
            .populate('createdTrips', 'title coverImage createdAt')
            .populate('savedTrips', 'title coverImage createdAt');

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json(user);
    } catch (error) {
        handleServerError(res, error, 'Error fetching user profile');
    }
};