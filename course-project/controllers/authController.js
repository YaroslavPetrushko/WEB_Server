// controllers/authController.js
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Реєстрація нового користувача
exports.register = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;
 
        // --- Крок 1: Валідація — чи всі поля заповнені? ---
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
                data: null
            });
        }
 
        // --- Крок 2: Чи збігаються паролі? ---
        // confirmPassword існує ТІЛЬКИ в req.body і ніколи не потрапляє в БД
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match',
                data: null
            });
        }
 
        // --- Крок 3: Додаткова валідація пароля ---
        // Перевіряємо складність: мінімум 8 символів, хоча б одна цифра і одна літера
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters and contain at least one letter and one number',
                data: null
            });
        }
 
        // --- Крок 4: Чи існує вже користувач із таким email? ---
        // User.findOne() — MongoDB-запит: шукаємо ОДИН документ за умовою { email }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                // 409 Conflict — стандартний HTTP-код для "ресурс вже існує"
                success: false,
                message: 'User with this email already exists',
                data: null
            });
        }
 
        // --- Крок 5: Хешування пароля ---
        // bcrypt.hash(password, saltRounds) — хешує пароль
        // 10 — це "cost factor" (salt rounds): чим більше, тим безпечніше, але повільніше.
        // 10 — стандартний баланс між безпекою і швидкістю.
        const hashedPassword = await bcrypt.hash(password, 10);
 
        // --- Крок 6: Збереження користувача в MongoDB ---
        // User.create() — створює і одразу зберігає документ у колекції.
        // Передаємо hashedPassword, а не оригінальний password!
        const user = await User.create({
            name,
            email,
            password: hashedPassword
            // role не передаємо — модель підставить 'user' за замовчуванням
        });
 
        // --- Крок 7: Відповідь клієнту ---
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
        res.status(500).json({
            success: false,
            message: err.message,
            data: null
        });
    }
};
