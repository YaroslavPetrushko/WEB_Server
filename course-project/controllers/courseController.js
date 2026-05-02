// controllers/courseController.js
const Course = require('../models/Course');
const AppError = require('../utils/AppError');


// GET /api/courses — отримати всі курси (публічний)
exports.getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find().populate('createdBy', 'name email');
    res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (err) {
    next(err);
  }
};


// GET /api/courses/:id — отримати один курс (публічний)
exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('createdBy', 'name');
    if (!course) return next(new AppError('Курс не знайдено', 404));
    res.status(200).json({ success: true, data: course });
  } catch (err) {
   next(err);
  }
};


// POST /api/courses — створити курс (тільки авторизований)
exports.createCourse = async (req, res, next) => {
  try {
    const course = await Course.create({
      ...req.body,
      createdBy: req.user._id
    });
    res.status(201).json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};


// PUT /api/courses/:id — оновити курс (тільки авторизований)
exports.updateCourse = async (req, res, next) => {

  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!course) return next(new AppError('Курс не знайдено', 404));
    res.status(200).json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};


// DELETE /api/courses/:id — видалити курс (тільки admin)
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return next(new AppError('Курс не знайдено', 404));
    res.status(200).json({ success: true, message: 'Курс видалено' });
  } catch (err) {
    next(err);
  }
};