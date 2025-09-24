const jwt = require('jsonwebtoken');
const User = require('../Models/User.Models.js');

module.exports = async function(req, res, next) {
    // Extract token from either the 'x-auth-token' header or 'Authorization' header
    const tokenFromHeader = req.header('x-auth-token') || req.header('Authorization');

    if (!tokenFromHeader) {
        return res.status(401).json({ message: 'No token provided. Authorization denied.' });
    }

    // Standardize token format by removing "Bearer " prefix if it exists
    const token = tokenFromHeader.startsWith('Bearer ') ? tokenFromHeader.slice(7) : tokenFromHeader;

    try {
        // Verify token and decode payload
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user from database and check for existence and activity
        const authenticatedUser = await User.findById(payload.user.id).select('-password -__v');
        
        if (!authenticatedUser) {
            return res.status(401).json({ message: 'User account not found. Authorization denied.' });
        }

        if (authenticatedUser.isDeactivated) {
            return res.status(401).json({ message: 'User account is inactive. Authorization denied.' });
        }

        // Attach user info to the request object for downstream use
        req.user = payload.user;;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Session expired. Please log in again.' });
        }
        
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token. Authorization denied.' });
        }
        
        console.error('Authentication middleware error:', err.message);
        return res.status(500).json({ message: 'Server error during authentication.' });
    }
};