// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false  // do not return in queries
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // enum — дозволяє лише ці два значення
        default: 'user'          // якщо роль не передано — ставимо 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save hook для хешування пароля перед збереженням
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return next();
 
    this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('User', userSchema);