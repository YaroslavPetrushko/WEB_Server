// middlewares/errorHandler.js
const ApiError = require('../errors/ApiError');
module.exports = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Server error';
    let errors = err.errors || [];
    // Якщо це наша кастомна помилка
    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
        errors = err.errors || [];
    }
    // Mongoose: неправильний ObjectId
    else if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
        errors = [{ field: err.path, msg: 'Invalid ObjectId' }];
    }
    // Mongoose: помилки валідації схеми
    else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Mongoose validation error';
        errors = Object.values(err.errors).map(e => ({
            field: e.path,
            msg: e.message
        }));
    }
    
    // Логування
    //console.error(err);
    res.status(statusCode).json({
        success: false,
        message,
        errors,
        statusCode
    });
    
    console.log(`${new Date().toISOString()} Error handled: ${statusCode} - ${message}`);
}
