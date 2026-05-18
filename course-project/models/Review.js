// models/Review.js
// Дочірня сутність — відгук на курс.
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    // rating — числова оцінка від 1 до 5
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },

    comment: {
        type: String,
        required: [true, 'Comment is required'],
        trim: true,
        minlength: [10, 'Comment must be at least 10 characters'],
        maxlength: [500, 'Comment cannot exceed 500 characters']
    },

    // course — посилання на батьківський документ Course
    // Значення береться з req.params.courseId у контролері
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },

    // user — посилання на автора відгуку
    // Береться з req.user._id
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Унікальний складений індекс: один користувач — один відгук на курс.
// { unique: true } на рівні схеми гарантує це на рівні БД.
// Якщо той самий user спробує залишити другий відгук на той самий course,
// MongoDB поверне помилку з code 11000 (duplicate key).
reviewSchema.index({ course: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);