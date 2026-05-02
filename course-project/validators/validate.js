// validators/validate.js

const AppError = require('../utils/AppError');

const validate = (schema) => (req, res, next) => {
    // schema.validate() — перевіряє req.body по правилам, описаним у Joi-схемі.
    // Параметри:
    //   abortEarly: false — збирати всі помилки, а не зупинятися на першій.
    //   stripUnknown: true — видаляти поля, яких немає в схемі (захищає від зайвих даних).
    const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        // error.details — масив об'єктів з описом кожної помилки.
        const message = error.details.map(d => d.message).join('; ');
        return next(new AppError(message, 400));
    }

    // Замінюємо req.body на провалідовані та очищені дані від Joi.
    req.body = value;
    next();
};

module.exports = validate;