// Wraps async controller functions to eliminate try-catch blocks
// Catches errors and passes them to error handler middleware
// Makes controller code cleaner and consistent

/**
 * Async Handler wrapper for Express controllers
 * Eliminates need for try-catch blocks in controllers
 * 
 * Usage:
 * const getUsers = asyncHandler(async (req, res) => {
 *   const users = await User.find();
 *   res.json(users);
 * });
 */


const ApiError = require('./apiError');

const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((err) => {
            // Convert to ApiError if not already
            if (!(err instanceof ApiError)) {
                // Mongoose validation errors
                if (err.name === 'ValidationError') {
                    const errors = Object.values(err.errors).map(e => e.message);
                    return next(ApiError.validation(errors.join(', '), errors));
                }

                // Mongoose duplicate key errors
                if (err.code === 11000) {
                    const field = Object.keys(err.keyPattern)[0];
                    return next(ApiError.conflict(`${field} already exists`));
                }

                // JWT errors
                if (err.name === 'JsonWebTokenError') {
                    return next(ApiError.unauthorized('Invalid token'));
                }

                if (err.name === 'TokenExpiredError') {
                    return next(ApiError.unauthorized('Token expired. Please refresh.'));
                }

                // Cast errors (invalid ObjectId)
                if (err.name === 'CastError') {
                    return next(ApiError.badRequest(`Invalid ${err.path}: ${err.value}`));
                }

                // Default to internal server error
                console.error('Unhandled Error:', err);
                return next(ApiError.internal(err.message));
            }

            return next(err);
        });
    };
};

module.exports = asyncHandler;