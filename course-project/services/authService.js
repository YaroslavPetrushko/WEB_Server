// services/authService.js
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// Реєстрація нового користувача
exports.registerUser = async ({ name, email, password, confirmPassword }) => {
    
    // Валідація: чи всі обов'язкові поля присутні
    if (!name || !email || !password || !confirmPassword) {
        throw new AppError('All fields are required', 400);
    }

    // Валідація збігання паролів
    if (password !== confirmPassword) {
        throw new AppError('Passwords do not match', 400);
    }

    // Валідація складності пароля
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
        throw new AppError(
            'Password must be at least 8 characters and contain at least one letter and one number',
            400
        );
    }

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