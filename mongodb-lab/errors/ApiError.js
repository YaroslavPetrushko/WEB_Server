// errors/ApiError.js
class ApiError extends Error {
    constructor(statusCode, message, errors = null) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
    }

    static badRequest(message = 'Bad request', errors = null) {
        return new ApiError(400, message, errors);
    }
    
    static ValidationError(message = 'Validation error', errors = null) {
            return new ApiError(400, message, errors);
    }

    static notFound(message = 'Not found') {
        return new ApiError(404, message);
    }

    static internal(message = 'Internal server error', errors = null) {
        return new ApiError(500, message, errors);
    }
}
module.exports = ApiError;