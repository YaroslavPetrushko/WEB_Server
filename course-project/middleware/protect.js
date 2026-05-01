// middleware/protect.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        // 1. Отримати токен з заголовка
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided',
                data: null
            });
        }

        const token = authHeader.split(' ')[1];

        // 2. Верифікація токена
        // jwt.verify(token, secret) — перевіряє:
        // Чи підпис токена збігається з JWT_SECRET (чи не підроблений)
        // І чи не закінчився термін дії (expiresIn)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Знайти користувача за id з токена
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Invalid token',
                data: null
            });
        }

        // 4. Додати користувача до запиту
        req.user = user;
        
        // 5. Продовжити виконання наступного middleware або маршруту
        next();

  } catch (err) {

    res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        data: null
    });
  }
};

module.exports = protect;