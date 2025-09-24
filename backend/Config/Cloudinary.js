const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test connection
const testCloudinaryConnection = async () => {
    try {
        await cloudinary.api.ping();
        console.log('✅ Cloudinary connected successfully!');
    } catch (error) {
        console.error('❌ Cloudinary connection error:', error.message);
    }
};


if (process.env.NODE_ENV !== 'test') {
    testCloudinaryConnection();
}

module.exports = cloudinary;