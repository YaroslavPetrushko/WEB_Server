// routes/health.js
const router = require('express').Router();
const mongoose = require('mongoose');

router.get('/health', async (req, res) => {
    const dbOk = mongoose.connection.readyState === 1; // 1 — connected

    res.status(dbOk ? 200 : 503).json({
        status: dbOk ? 'ok' : 'error',
        db: dbOk ? 'connected' : 'disconnected',
        uptime: Math.round(process.uptime()) + 's', // час роботи сервера в секундах
        env: process.env.NODE_ENV,
    });
});

module.exports = router;