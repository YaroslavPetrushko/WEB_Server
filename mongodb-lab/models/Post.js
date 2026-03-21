const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Заголовок обов'язковий"],
        trim: true,
        minlength: [5, 'Заголовок має бути не менше 5 символів'],
        maxlength: [200, 'Заголовок не може перевищувати 200 символів']
    },
    content: {
        type: String,
        required: [true, "Вміст обов'язковий"],
        minlength: [10, 'Вміст має бути не менше 10 символів']
    },
    author: {
        type: String,
        required: [true, "Автор обов'язковий"],
        trim: true,
        minlength: [2, 'Ім\'я автора має бути не менше 2 символів'],
        maxlength: [50, 'Ім\'я автора не може перевищувати 50 символів'],
         // Тільки літери, пробіли та дефіси
        match: [/^[a-zA-Zа-яА-ЯіІїЇєЄ\s'-]+$/, "Ім'я автора містить недопустимі символи"]
    },
    tags: {
        type: [{ type: String, trim: true, maxlength: [30, 'Тег не може перевищувати 30 символів'] }],
        validate: {
            // Не більше 10 тегів
            validator: (tags) => tags.length <= 10,
            message: 'Пост не може мати більше 10 тегів'
        }
    },
    likes: {
        type: Number,
        default: 0,
        min: [0, 'Кількість лайків не може бути від\'ємною']
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

postSchema.index({ title: 'text', content: 'text' });
module.exports = mongoose.model('Post', postSchema);