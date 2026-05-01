// controllers/authController.js
const express = require('express');

const router = express.Router();

const { register, login, getMe } = require('../controllers/authController');
const protect = require('../middleware/protect');

// POST /api/auth/register — реєстрація нового користувача (відкритий)
router.post('/register', register);
 
// POST /api/auth/login — вхід, отримання JWT-токена (відкритий)
router.post('/login', login);
 
// GET /api/auth/me — профіль поточного користувача (захищений)
router.get('/me', protect, getMe);

module.exports = router;