// controllers/authController.js
const express = require('express');

const router = express.Router();

const {register} = require('../controllers/authController');

// POST /api/auth/register — маршрут для реєстрації нового користувача
router.post('/register', register);

module.exports = router;