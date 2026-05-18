// services/authService.js
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// Реєстрація нового користувача
exports.registerUser = async ({ name, email, password, confirmPassword }) => {

    // Перевірка унікальності email
    const existing = await User.findOne({ email });
    if (existing) throw new AppError('User with this email already exists', 409);
    
    // User.create() → спрацює pre-save hook → bcrypt.hash() автоматично.
    // Передаємо відкритий пароль — модель сама його хешує перед збереженням.
    const user = await User.create({ name, email, password });

    return user;
};

// Вхід користувача
exports.loginUser = async ({ email, password }) => {
    
    if (!email || !password) {
        throw new AppError('Email and password are required', 400);
    }

    // .select('+password') — явно запитуємо пароль (select: false у схемі)
    const user = await User.findOne({ email }).select('+password');
    
    // Обидві перевірки — однакове повідомлення (захист від enumeration-атаки)
    const isMatch = user && await bcrypt.compare(password, user.password);
    if (!user || !isMatch) throw new AppError('Invalid email or password', 401);

    return user;
};