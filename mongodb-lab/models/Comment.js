const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    post: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Post', 
        required: [true, "Пост обов'язковий"] 
    }, 
    author: {
        type: String, 
        required: [true, "Автор обов'язковий"], 
        trim: true,
        minlength: [2, "Ім'я автора має бути не менше 2 символів"],
        maxlength: [50, "Ім'я автора не може перевищувати 50 символів"],
        match: [/^[a-zA-Zа-яА-ЯіІїЇєЄ\s'-]+$/, "Ім'я автора містить недопустимі символи"]
    }, 
    content: { 
        type: String, 
        required: [true, "Вміст коментаря обов'язковий"], 
        maxlength: [1000, 'Коментар занадто довгий'] 
    }, 
    createdAt: { type: Date, default: Date.now } 
}); 

module.exports = mongoose.model('Comment', commentSchema);
