const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const AppError = require('../utils/AppError');

// Записатись на курс
exports.enrollUser = async (userId, courseId) => {
    const course = await Course.findById(courseId);
    if (!course) throw new AppError('Course not found', 404);

    try {
        const enrollment = await Enrollment.create({ user: userId, course: courseId });
        return enrollment.populate('course');
    } catch (err) {
        // Mongoose duplicate key error (індекс { user, course })
        if (err.code === 11000) throw new AppError('You are already enrolled in this course', 409);
        throw err;
    }
};

// Відписатись від курсу
exports.unenrollUser = async (userId, courseId) => {
    const enrollment = await Enrollment.findOneAndDelete({ user: userId, course: courseId });
    if (!enrollment) throw new AppError('Enrollment not found', 404);
    return enrollment;
};

// Отримати всі курси користувача (кабінет)
exports.getUserEnrollments = async (userId) => {
    return await Enrollment.find({ user: userId })
        .populate({
            path: 'course',
            populate: { path: 'createdBy', select: 'name email' }
        })
        .sort({ enrolledAt: -1 });
};

// Перевірити, чи записаний користувач на конкретний курс
exports.checkEnrollment = async (userId, courseId) => {
    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    return !!enrollment;
};