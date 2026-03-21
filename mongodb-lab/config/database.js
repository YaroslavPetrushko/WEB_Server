const mongoose = require('mongoose');
const connectDB = async () => {
try {
    // Atlas: береться з .env
    // Local: mongodb://localhost:27017/blog_db
    const conn = await mongoose.connect(
        process.env.MONGODB_URI || 'mongodb://localhost:27017/blog_db'
    );
    
    console.log(`MongoDB підключено: ${conn.connection.host}`);
} catch (error) {
    console.error(`Помилка підключення: ${error.message}`);
    process.exit(1);
}
};

module.exports = connectDB;