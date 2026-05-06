// server.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const AppError = require('./utils/AppError');

const app = express();

// CORS — має бути до всіх маршрутів

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5500',
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(cookieParser()); // читати cookies з запитів

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);

// 404 handler
app.use((req, res, next) => {
  next(new AppError(`${req.originalUrl} not found`, 404));
});

// Centralized error handling middleware
app.use((err, req, res, next) => {

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  res.status(statusCode).json({

    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Connect to MongoDB and start the server
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected');
 
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server: http://localhost:${PORT}`);
            console.log(`Client: ${process.env.CLIENT_URL || 'http://localhost:5500'}`);
        });
    })
    .catch((err) => {
        // Якщо підключення до БД не вдалося — виводимо помилку і зупиняємо процес.
        console.error('MongoDB connection error:', err.message);
        process.exit(1);  // код 1 = аварійне завершення
    });