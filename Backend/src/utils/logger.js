// Application logger - Console only, no file storage
// Clean, simple, and Swagger-aware logging

class Logger {
    constructor() {
        this.level = process.env.LOG_LEVEL || 'info';
    }

    // Check if Swagger request - SKip the Swagger logs
    isSwaggerRequest(url) {
        if (!url) return false;
        return url.startsWith('/api-docs') ||
            url.startsWith('/api-docs/') ||
            url.includes('swagger') ||
            url.includes('api-docs');
    }

    // Check if should log to console
    shouldLogToConsole(url) {
        if (this.isSwaggerRequest(url)) {
            return false;
        }
        return true;
    }

    // Error log - console only
    error(message, meta = {}) {
        const url = meta?.url || meta?.req?.url || '';
        if (this.shouldLogToConsole(url)) {
            console.error(`[ERROR] ${message}`, Object.keys(meta).length ? meta : '');
        }
    }

    // Important log - console only
    important(message, meta = {}) {
        const url = meta?.url || meta?.req?.url || '';
        if (this.shouldLogToConsole(url)) {
            console.log(`[IMPORTANT] ${message}`, Object.keys(meta).length ? meta : '');
        }
    }

    // Security log - console only
    security(message, meta = {}) {
        const url = meta?.url || meta?.req?.url || '';
        if (this.shouldLogToConsole(url)) {
            console.warn(`[SECURITY] ${message}`, Object.keys(meta).length ? meta : '');
        }
    }

    // Info log - console only
    info(message, meta = {}) {
        const url = meta?.url || meta?.req?.url || '';
        if (this.shouldLogToConsole(url)) {
            console.log(`[INFO] ${message}`, Object.keys(meta).length ? meta : '');
        }
    }

    // Debug log - console only
    debug(message, meta = {}) {
        const url = meta?.url || meta?.req?.url || '';
        if (this.shouldLogToConsole(url)) {
            console.debug(`[DEBUG] ${message}`, Object.keys(meta).length ? meta : '');
        }
    }

    // Warn log - console only
    warn(message, meta = {}) {
        const url = meta?.url || meta?.req?.url || '';
        if (this.shouldLogToConsole(url)) {
            console.warn(`[WARN] ${message}`, Object.keys(meta).length ? meta : '');
        }
    }

    // Request logger - Swagger skip
    logRequest(req) {
        const url = req.originalUrl || req.url;
        if (this.isSwaggerRequest(url)) {
            return;
        }
        console.log(`[REQUEST] ${req.method} ${url}`);
    }

    // Response logger - Swagger skip
    logResponse(req, res, duration) {
        const url = req.originalUrl || req.url;
        if (this.isSwaggerRequest(url)) {
            return;
        }
        console.log(`[RESPONSE] ${req.method} ${url} - ${res.statusCode} (${duration}ms)`);
    }

    // Detailed request logger - Swagger skip
    logRequestDetails(req, meta = {}) {
        const url = req.originalUrl || req.url;
        if (this.isSwaggerRequest(url)) {
            return;
        }

        const logData = {
            method: req.method,
            url: url,
            ip: req.ip || req.connection?.remoteAddress,
            userAgent: req.get('user-agent'),
            userId: req.user?._id || req.user?.id || undefined,
            ...meta
        };

        console.log(`[REQUEST] ${req.method} ${url}`, logData);
    }

    // Detailed response logger - Swagger skip
    logResponseDetails(req, res, duration, meta = {}) {
        const url = req.originalUrl || req.url;
        if (this.isSwaggerRequest(url)) {
            return;
        }

        const logData = {
            method: req.method,
            url: url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userId: req.user?._id || req.user?.id || undefined,
            ...meta
        };

        console.log(`[RESPONSE] ${req.method} ${url} - ${res.statusCode} (${duration}ms)`, logData);
    }
}

module.exports = new Logger();