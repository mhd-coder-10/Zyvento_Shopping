// Custom error class for API errors
// Creates consistent error objects with status codes
// Supports different error types (bad request, unauthorized, not found, etc.)

class ApiError extends Error {
    constructor(statusCode, message, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.message = message;
        this.success = false;
        this.timestamp = new Date().toISOString();

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    // ============ STATIC METHODS ============

    static badRequest(message = 'Bad Request') {
        return new ApiError(400, message);
    }

    static unauthorized(message = 'Unauthorized. Please login to continue.') {
        return new ApiError(401, message);
    }

    static forbidden(message = 'Forbidden. You do not have permission.') {
        return new ApiError(403, message);
    }

    static notFound(message = 'Resource not found') {
        return new ApiError(404, message);
    }

    static conflict(message = 'Resource already exists') {
        return new ApiError(409, message);
    }

    static validation(message = 'Validation Error', errors = null) {
        const error = new ApiError(422, message);
        error.errors = errors;
        return error;
    }

    static tooManyRequests(message = 'Too many requests. Please try again later.') {
        return new ApiError(429, message);
    }

    static internal(message = 'Internal Server Error') {
        return new ApiError(500, message);
    }

    static serviceUnavailable(message = 'Service temporarily unavailable') {
        return new ApiError(503, message);
    }

    // ============ TO JSON ============

    toJSON() {
        return {
            success: this.success,
            statusCode: this.statusCode,
            message: this.message,
            timestamp: this.timestamp,
            ...(this.errors && { errors: this.errors }),
            ...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
        };
    }
}

module.exports = ApiError;