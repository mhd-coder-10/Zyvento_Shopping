
// Limits number of requests from a single IP
// Prevents brute force attacks and API abuse
// Configurable rate limits for different routes

const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/apiError');

// REMOVED custom keyGenerator
const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        success: false,
        message: 'Too many requests from this IP. Please try again after 15 minutes.',
        retryAfter: '15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        return req.path === '/health';
    },
    handler: (req, res) => {
        throw ApiError.tooManyRequests('Too many requests. Please try again later.');
    },
});

// REMOVED custom keyGenerator
const strictRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        success: false,
        message: 'Too many authentication attempts. Please try again after 15 minutes.',
        retryAfter: '15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        throw ApiError.tooManyRequests('Too many attempts. Please try again later.');
    },
});

// REMOVED custom keyGenerator
const otpRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: 'Too many OTP requests. Please try again after 5 minutes.',
        retryAfter: '5 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        throw ApiError.tooManyRequests('Too many OTP requests. Please try again later.');
    },
});

module.exports = {
    rateLimiter,
    strictRateLimiter,
    otpRateLimiter,
};