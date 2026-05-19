// server.js
require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');

const REQUIRED_ENV = ['JWT_SECRET', 'MONGODB_URI', 'JWT_EXPIRES_IN'];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length) {
    console.error(`❌ Missing env variables: ${missing.join(', ')}`);
    process.exit(1);
}

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected');
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server: http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    });