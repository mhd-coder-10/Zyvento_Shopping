// Loads environment variables from .env file
// Configures all application settings like port, database, JWT, Cloudinary


require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const environment = {

    // ============ SERVER ============
    PORT: parseInt(process.env.PORT, 10) || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',

    
    // ============ DATABASE ============
    MONGODB_URI: process.env.MONGODB_URI,

    
    // ============ JWT ============
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
    JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',

    // ============ CLOUDINARY ============
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER || 'ecommerce',

    // ============ EMAIL ============
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: parseInt(process.env.EMAIL_PORT, 10) || 587,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@marketplace.com',

    // ============ OTP ============
    OTP_EXPIRY_MINUTES: parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 10,
    OTP_LENGTH: parseInt(process.env.OTP_LENGTH, 10) || 6,

    // ============ FILE UPLOAD ============
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024,
    UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',

    // ============ CORS ============
    CLIENT_URL: process.env.CLIENT_URL,

    // ============ RATE LIMITING ============
    RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 15 * 60 * 1000,
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,

    // ============ SUPER ADMIN ============
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL || 'admin@marketplace.com',
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD || 'Admin@123',
    SUPER_ADMIN_FIRST_NAME: process.env.SUPER_ADMIN_FIRST_NAME || 'Super',
    SUPER_ADMIN_LAST_NAME: process.env.SUPER_ADMIN_LAST_NAME || 'Admin',
};

// Validate required environment variables
const requiredKeys = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
for (const key of requiredKeys) {
    if (!environment[key]) {
        throw new Error(`❌ ${key} is required in environment variables`);
    }
}

module.exports = environment;