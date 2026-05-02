// controllers/authController.js
const express = require('express');

const router = express.Router();

const { register, login, getMe } = require('../controllers/authController');
const protect = require('../middleware/protect');
const validate = require('../validators/validate');
const { registerSchema, loginSchema } = require('../validators/authValidator');

// POST /api/auth/register — реєстрація нового користувача (відкритий)
router.post('/register', validate(registerSchema), register);
 
// POST /api/auth/login — вхід, отримання JWT-токена (відкритий)
router.post('/login', validate(loginSchema), login);

// GET /api/auth/me — профіль поточного користувача (захищений)
router.get('/me', protect, getMe);

module.exports = router;