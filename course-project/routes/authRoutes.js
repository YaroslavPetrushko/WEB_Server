// controllers/authController.js
const express = require('express');

const router = express.Router();

const protect = require('../middleware/protect');
const validate = require('../validators/validate');
const { register, login, logout, getMe } = require('../controllers/authController');
const { registerSchema, loginSchema } = require('../validators/authValidator');
const { getMyEnrollments } = require('../controllers/enrollmentController');

// POST /api/auth/register — реєстрація нового користувача (відкритий)
router.post('/register', validate(registerSchema), register);
 
// POST /api/auth/login — вхід, отримання JWT-токена (відкритий)
router.post('/login', validate(loginSchema), login);

// POST /api/auth/logout - вихід користувача (захищений через protect)
router.post('/logout', protect, logout);

// GET /api/auth/me — профіль поточного користувача (захищений через protect)
router.get('/me', protect, getMe);

// GET /api/auth/me/courses — мої записи на курси
router.get('/me/courses', protect, getMyEnrollments);

module.exports = router;