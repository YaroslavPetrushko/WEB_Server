require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();

connectDB();

app.use(express.json());

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

app.use((req, res) => {
    res.status(404).json({ message: 'Маршрут не знайдено' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Сервер запущено на порту ${PORT}`));