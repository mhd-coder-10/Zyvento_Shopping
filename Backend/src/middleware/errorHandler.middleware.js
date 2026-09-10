// Global error handler for all exceptions
// Converts errors to consistent API response format
// Logs errors and sends appropriate status codes

const ApiError = require('../utils/apiError');
const logger = require('../utils/logger');

/**
 * Global Error Handler Middleware
 * Handles all errors and sends consistent response
 */
const errorHandler = (err, req, res, next) => {
    let error = err;

    // ============ CONVERT TO APIERROR ============
    if (!(error instanceof ApiError)) {
        // Mongoose Validation Error
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((e) => e.message);
            error = ApiError.validation(errors.join(', '), errors);
        }
        // Mongoose Duplicate Key Error
        else if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            error = ApiError.conflict(`${field} already exists`);
        }
        // Mongoose Cast Error
        else if (error.name === 'CastError') {
            error = ApiError.badRequest(`Invalid ${error.path}: ${error.value}`);
        }
        // JWT Errors
        else if (error.name === 'JsonWebTokenError') {
            error = ApiError.unauthorized('Invalid token');
        } else if (error.name === 'TokenExpiredError') {
            error = ApiError.unauthorized('Token expired. Please refresh.');
        }
        // Multer Errors
        else if (error.code === 'LIMIT_FILE_SIZE') {
            error = ApiError.badRequest('File too large. Maximum size is 10MB.');
        } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            error = ApiError.badRequest('Unexpected file field');
        }
        // Default
        else {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal Server Error';
            error = new ApiError(statusCode, message, false, error.stack);
        }
    }

    // ============ LOG ERROR ============
    const logMeta = {
        path: req.path,
        method: req.method,
        ip: req.ip,
        userId: req.userId,
        userAgent: req.get('user-agent'),
    };

    if (error.statusCode >= 500) {
        logger.error(error.message, { ...logMeta, stack: error.stack });
    } else {
        logger.warn(error.message, logMeta);
    }

    // ============ RESPONSE ============
    const response = {
        success: false,
        statusCode: error.statusCode,
        message: error.message,
        path: req.path,
        timestamp: new Date().toISOString(),
    };

    // Add validation errors if present
    if (error.errors) {
        response.errors = error.errors;
    }

    // Add stack trace in development
    if (process.env.NODE_ENV === 'development') {
        response.stack = error.stack;
    }

    res.status(error.statusCode).json(response);
};

module.exports = errorHandler;