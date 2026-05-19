// app.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const AppError = require('./utils/AppError');

const app = express();

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Rate limiter вимикається в тестах щоб не блокувати запити
const makeLimiter = (max) => process.env.NODE_ENV === 'test'
    ? (req, res, next) => next()
    : rateLimit({
        windowMs: 15 * 60 * 1000,
        max,
        message: { success: false, message: 'Too many requests, please try again later' }
    });

const authLimiter   = makeLimiter(20);
const globalLimiter = makeLimiter(200);

app.use(globalLimiter);

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5500').split(',');
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/reviews', reviewRouter);
app.use('/api', require('./routes/health'));

app.use((req, res, next) => {
    next(new AppError(`${req.originalUrl} not found`, 404));
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : 'Internal server error';
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

module.exports = app;