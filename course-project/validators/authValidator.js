// validators/authValidator.js
const Joi = require('joi');

// Схема валідації для реєстрації
const registerSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.min': 'Name must be at least 2 characters long',
            'string.max': 'Name cannot exceed 50 characters',
            'any.required': 'Name is required'
        }),
 
    email: Joi.string()
        .email()             // Joi перевіряє формат email сам — не потрібен regex
        .lowercase()
        .required()
        .messages({
            'string.email': 'Invalid email format',
            'any.required': 'Email is required'
        }),
 
    password: Joi.string()
        .min(8)
        // pattern — аналог regex, але з описом помилки
        .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters long',
            'string.pattern.base': 'Password must contain at least one letter and one number',
            'any.required': 'Password is required'
        }),

    confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
            'any.only': 'Passwords do not match',
            'any.required': 'Please confirm your password'
        })
});

// Схема валідації для входу
const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .lowercase()
        .required()
        .messages({
            'string.email': 'Invalid email format',
            'any.required': 'Email is required'
        }),
 
    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Password is required'
        })
});
 
module.exports = { registerSchema, loginSchema };
