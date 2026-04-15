// app.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
// Routes
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();

connectDB();

// Middleware для парсингу JSON
app.use(express.json());

// Error handling middleware (після всіх маршрутів)
const ApiError = require('./errors/ApiError');
const errorHandler = require('./middlewares/errorHandler');

//-- routes --
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

app.get('/', (req, res) => {
    res.json({
        message: 'API для роботи з постами та коментарями',
        endpoints: {
            posts: '/api/posts',
            comments: '/api/comments'
        }
    });
});

// -- 404 (після всіх маршрутів) --
app.use((req, res, next) => {
    next(ApiError.notFound('Маршрут не знайдено'));
});

// -- Error handling middleware --
app.use(errorHandler);

module.exports = app;

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Сервер запущено на порту ${PORT}`));