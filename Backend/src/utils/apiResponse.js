// Standard API response formatter for consistent responses
// Creates success, created, paginated responses with proper structure
// Used by all controllers to send responses

class ApiResponse {
    constructor(statusCode, data, message = 'Success') {
        this.success = statusCode < 400;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.timestamp = new Date().toISOString();
    }

    // ============ STATIC METHODS ============

    static success(data, message = 'Success', statusCode = 200) {
        return new ApiResponse(statusCode, data, message);
    }

    static created(data, message = 'Created successfully', statusCode = 201) {
        return new ApiResponse(statusCode, data, message);
    }

    static accepted(data, message = 'Request accepted', statusCode = 202) {
        return new ApiResponse(statusCode, data, message);
    }

    static noContent(message = 'No content', statusCode = 204) {
        return new ApiResponse(statusCode, null, message);
    }

    static paginated(data, pagination, message = 'Success', statusCode = 200) {
        const response = new ApiResponse(statusCode, data, message);
        response.pagination = pagination;
        return response;
    }

    static withMeta(data, meta, message = 'Success', statusCode = 200) {
        const response = new ApiResponse(statusCode, data, message);
        response.meta = meta;
        return response;
    }

    // ============ TO JSON ============

    toJSON() {
        const response = {
            success: this.success,
            statusCode: this.statusCode,
            message: this.message,
            data: this.data,
            timestamp: this.timestamp,
        };

        if (this.pagination) {
            response.pagination = this.pagination;
        }

        if (this.meta) {
            response.meta = this.meta;
        }

        return response;
    }
}

module.exports = ApiResponse;