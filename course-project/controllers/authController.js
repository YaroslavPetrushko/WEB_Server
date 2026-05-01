// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Допоміжна функція генерації токена
const generateToken = (id, role) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

// POST /api/auth/register  Реєстрація нового користувача
exports.register = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;
 
        // 1. Валідація — чи всі поля заповнені?
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
                data: null
            });
        }
 
        // 2. Чи збігаються паролі?
        // confirmPassword існує ТІЛЬКИ в req.body і ніколи не потрапляє в БД
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match',
                data: null
            });
        }
 
        // 3. Додаткова валідація пароля
        // Перевіряємо складність: мінімум 8 символів, хоча б одна цифра і одна літера
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters and contain at least one letter and one number',
                data: null
            });
        }
 
        // 4. Чи існує вже користувач із таким email?
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
            password: hashedPassword
            // role не передаємо — модель підставить 'user' за замовчуванням
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
        res.status(500).json({ success: false, message: err.message, data: null });
    }
};

// POST /api/auth/login - Вхід користувача
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Перевірка наявності полів
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
                data: null
            });
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
        return res.status(401).json({
            // 401 Unauthorized — клієнт не автентифікований
            success: false,
            message: 'Invalid email or password',
            data: null
        });
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
        res.status(500).json({ success: false, message: err.message, data: null });
    }
};


// GET /api/auth/me - Отримати профіль поточного користувача
// Цей маршрут доступний лише з валідним токеном.
// Middleware protect (викликається ДО цієї функції в маршруті)
exports.getMe = async (req, res) => {
    try {
        // req.user встановлюється middleware protect
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            message: 'Profile retrieved successfully',
            data: { user }
        });
 
    } catch (err) {
        res.status(500).json({ success: false, message: err.message, data: null });
    }
};
