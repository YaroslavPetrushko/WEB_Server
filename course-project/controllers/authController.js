// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const e = require('express');

// Допоміжна функція генерації токена
const generateToken = (id, role) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

// POST /api/auth/register  Реєстрація нового користувача
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, confirmPassword, role} = req.body;
 
        // 1. Валідація — чи всі поля заповнені?
        if (!name || !email || !password || !confirmPassword) {
            return next(new AppError('All fields are required', 400));
        }
 
        // 2. Чи збігаються паролі?
        // confirmPassword існує ТІЛЬКИ в req.body і ніколи не потрапляє в БД
        if (password !== confirmPassword) {
            return next(new AppError('Passwords do not match', 400));
        }
 
        // 3. Додаткова валідація пароля
        // Перевіряємо складність: мінімум 8 символів, хоча б одна цифра і одна літера
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
                return next(new AppError('Password must be at least 8 characters long and contain at least one letter and one number', 400));
            }
 
        // 4. Чи існує вже користувач із таким email?
        // User.findOne() — MongoDB-запит: шукаємо ОДИН документ за умовою { email }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new AppError('User with this email already exists', 409));
        }
 
        // 5. Хешування пароля
        // bcrypt.hash(password, saltRounds) — хешує пароль
        // 10 — це "cost factor" (salt rounds): чим більше, тим безпечніше, але повільніше.
        // 10 — стандартний баланс між безпекою і швидкістю.
        const hashedPassword = await bcrypt.hash(password, 10);
 
        // 6. Збереження користувача в MongoDB
        // User.create() — створює і одразу зберігає документ у колекції.
        // Передаємо hashedPassword, а не оригінальний password!
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'user' // якщо роль не передана, ставимо 'user' за замовчуванням
        });
 
        // 7. Відповідь клієнту
        // Повертаємо 201 Created — стандарт для успішного створення ресурсу.
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                id: user._id,       // _id — унікальний ідентифікатор MongoDB
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }
        });
 
    } catch (err) {
        // try-catch перехоплює будь-які помилки (мережа, БД, валідація Mongoose).
        // Повертаємо 500 Internal Server Error — щось пішло не так на сервері.
       next(err);
    }
};

// POST /api/auth/login - Вхід користувача
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Перевірка наявності полів
        if (!email || !password) {
            return next(new AppError('Email and password are required', 400));
        }

    // 2. Пошук користувача за email
    // .select('+password') — явно запитуємо поле password, бо в моделі
    // стоїть select: false (за замовчуванням воно не повертається).
    const user = await User.findOne({ email }).select('+password');

    // 3. Перевірка пароля
    // Обидві перевірки (існування юзера і пароль) повертають
    // ОДНАКОВЕ повідомлення 'Invalid email or password'.
    const isMatch = user && await bcrypt.compare(password, user.password);
 
    if (!user || !isMatch) {
        // 401 Unauthorized — клієнт не автентифікований
        return next(new AppError('Invalid email or password', 401));
    }

    // 4. Генерація JWT токена
    // Токен містить id і role — достатньо для більшості перевірок у middleware.
    const token = generateToken(user._id, user.role);

    // 5. Відповідь
    // Клієнт збереже token і надсилатиме його у заголовку
    // Authorization: Bearer <token> при кожному захищеному запиті.
    res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        }
    });

    } catch (err) {
       next(err);
    }
};


// GET /api/auth/me - Отримати профіль поточного користувача
// Цей маршрут доступний лише з валідним токеном.
// Middleware protect (викликається ДО цієї функції в маршруті)
exports.getMe = async (req, res, next) => {
    try {
        // req.user встановлюється middleware protect
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            message: 'Profile retrieved successfully',
            data: { user }
        });
 
    } catch (err) {
        next(err);
    }
};
