// Request Logger Middleware - Logs all incoming requests and responses
// Logs all incoming HTTP requests and responses
// Tracks request method, URL, status code, response time
// Helps in debugging and monitoring API performance

const logger = require('../utils/logger');

const loggerMiddleware = (req, res, next) => {
    const start = Date.now();

    // ============ LOG REQUEST ============
    logger.info(`📥 ${req.method} ${req.originalUrl}`, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        userId: req.userId,
    });

    // ============ INTERCEPT RESPONSE ============
    const originalSend = res.send;
    const originalJson = res.json;

    res.send = function(data) {
        const duration = Date.now() - start;
        logger.info(`📤 ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`, {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userId: req.userId,
        });
        return originalSend.call(this, data);
    };

    res.json = function(data) {
        const duration = Date.now() - start;
        logger.info(`📤 ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`, {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userId: req.userId,
        });
        return originalJson.call(this, data);
    };

    next();
};

module.exports = loggerMiddleware;