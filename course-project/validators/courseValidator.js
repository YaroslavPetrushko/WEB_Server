// validators/courseValidator.js
const Joi = require('joi');

// Схема створення курсу (POST /api/courses)
const createCourseSchema = Joi.object({
    title: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.min': 'Title must be at least 3 characters long',
            'string.max': 'Title cannot exceed 100 characters',
            'any.required': 'Title is required'
        }),

    description: Joi.string()
        .trim()
        .min(10)
        .required()
        .messages({
            'string.min': 'Description must be at least 10 characters long',
            'any.required': 'Description is required'
        }),

    instructor: Joi.string()
        .trim()
        .required()
        .messages({
            'any.required': 'Instructor name is required'
        }),

    price: Joi.number()
        .min(0)
        .required()
        .messages({
            'number.min': 'Price cannot be negative',
            'any.required': 'Price is required'
        }),

    duration: Joi.number()
        .integer()          // тривалість у годинах — ціле число
        .min(1)
        .required()
        .messages({
            'number.integer': 'Duration must be a whole number of hours',
            'number.min': 'Duration must be at least 1 hour',
            'any.required': 'Duration is required'
        })
});

// Схема оновлення курсу (PUT /api/courses/:id)
const updateCourseSchema = createCourseSchema.fork(
    ['title', 'description', 'instructor', 'price', 'duration'],
    field => field.optional()
);

module.exports = { createCourseSchema, updateCourseSchema };