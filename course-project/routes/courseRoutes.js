// routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const restrictTo = require('../middleware/restrictTo');
const validate = require('../validators/validate');
const { createCourseSchema, updateCourseSchema } = require('../validators/courseValidator');

const {
  getAllCourses, getCourse, createCourse, updateCourse, deleteCourse
} = require('../controllers/courseController');


// Публічні маршрути — токен не потрібен
// GET /api/courses?page=1&limit=10&instructor=John
router.get('/', getAllCourses);
router.get('/:id', getCourse);

// Тільки авторизовані
router.post('/', protect, validate(createCourseSchema), createCourse);
router.put('/:id', protect, validate(updateCourseSchema), updateCourse);

// Тільки адмін
router.delete('/:id', protect, restrictTo('admin'), deleteCourse);

module.exports = router;