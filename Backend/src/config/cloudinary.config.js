// Cloudinary configuration for image/file uploads
// Sets up cloudinary with API credentials from environment

const cloudinary = require('cloudinary').v2;
const environment = require('./environment');

// Configure Cloudinary
cloudinary.config({
    cloud_name: environment.CLOUDINARY_CLOUD_NAME,
    api_key: environment.CLOUDINARY_API_KEY,
    api_secret: environment.CLOUDINARY_API_SECRET,
    secure: true,
});

// Test connection
const testCloudinaryConnection = async () => {
    try {
        const result = await cloudinary.api.ping();
        console.log('✅ Cloudinary Connected Successfully');
        return result;
    } catch (error) {
        console.error('❌ Cloudinary Connection Error:', error.message);
        console.warn('⚠️ Cloudinary is not configured. File uploads will fail.');
    }
};

// Export cloudinary instance
module.exports = {
    cloudinary,
    testCloudinaryConnection,
};