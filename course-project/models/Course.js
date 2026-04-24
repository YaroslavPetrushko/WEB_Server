// models/Course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters long'],
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters long']
    },
    instructor: {
        type: String,
        required: [true, 'Instructor name is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        // min — мінімально допустиме значення (безкоштовний курс = 0)
        min: [0, 'Price cannot be negative']
    },
    duration: {
        // Тривалість курсу в годинах
        type: Number,
        required: [true, 'Duration is required'],
        min: [1, 'Duration must be at least 1 hour']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Course', courseSchema);