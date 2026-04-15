// middlewares/validate.js
const { validationResult } = require('express-validator');
const ApiError = require('../errors/ApiError');

module.exports = (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
        return next(
            ApiError.ValidationError('Validation failed',
                result.array().map(e => ({
                    field: e.path || e.param,
                    message: e.msg
                }))
            )
        );
    }

    next();
};