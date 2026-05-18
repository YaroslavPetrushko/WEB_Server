const Joi = require('joi');

const createReviewSchema = Joi.object({
  rating: Joi.number()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.min': 'Оцінка не може бути менше 1',
      'number.max': 'Оцінка не може бути більше 5',
      'any.required': 'Оцінка обов\'язкова'
    }),

  comment: Joi.string()
    .min(10)
    .max(500)
    .required()
    .messages({
      'string.min': 'Відгук має містити мінімум 10 символів',
      'any.required': 'Текст відгуку обов\'язковий'
    })
});

module.exports = {createReviewSchema};