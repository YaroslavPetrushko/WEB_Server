// middleware/protect.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const protect = catchAsync(async (req, res, next) => {
        // Отримати токен з заголовка
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new AppError('No token provided. Authorization denied', 401));
        }

        const token = authHeader.split(' ')[1];

        // Верифікація токена
        // jwt.verify() кидає специфічні помилки з різними name:
        //   TokenExpiredError — токен дійсний, але термін вийшов
        //   JsonWebTokenError — підпис невірний або токен зіпсований
        let decoded;
        try{
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return next(new AppError('Token expired. Please login again', 401));
            }
            return next(new AppError('Invalid token. Login again', 401));
        }

        // Знайти користувача за id з токена
        const user = await User.findById(decoded.id);
        if (!user) return next(new AppError('User not found', 401));
        
        // Додати користувача до запиту
        req.user = user;
        next();
});

module.exports = protect;