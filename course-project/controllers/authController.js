// controllers/authController.js
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const authService = require('../services/authService');

// Допоміжна функція генерації токена
const generateToken = (id, role) => 
    jwt.sign({ id, role }, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES_IN
    });

// POST /api/auth/register - Реєстрація нового користувача
exports.register = catchAsync (async(req, res) => {
    const user = await authService.registerUser(req.body);
    const token = generateToken(user._id, user.role);

    // Повертаємо 201 Created з токеном і даними користувача
    res.status(201).json({
        success: true,
        message: 'Registration successful. Here is your token:',
        data:{
            token,
            user: { id: user._id, name: user.name,email: user.email, role: user.role }
        }
    });
});

// POST /api/auth/login - Вхід користувача
exports.login = catchAsync (async(req, res) => {
    const user = await authService.loginUser(req.body);
    const token = generateToken(user._id, user.role);

    // Повартаємо 200 з токеном і даними користувача. 
    // Клієнт повинен зберігати цей токен (наприклад, в localStorage) і відправляти його в заголовку
    // Authorization: Bearer <token> при кожному захищеному запиті.
    res.status(200).json({
        success: true,
        message: 'Login successful. Here is your token:',
        data: {
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        }
     });
});

// GET /api/auth/me - Отримати профіль поточного користувача
// Цей маршрут доступний лише з валідним токеном.
// Middleware protect (викликається ДО цієї функції в маршруті)
exports.getMe = catchAsync(async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: { user: req.user }
    });
});