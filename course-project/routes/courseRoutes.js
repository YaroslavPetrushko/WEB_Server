// routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const restrictTo = require('../middleware/restrictTo');
const {
  getAllCourses, getCourse, createCourse, updateCourse, deleteCourse
} = require('../controllers/courseController');


// Публічні маршрути
router.get('/', getAllCourses);
router.get('/:id', getCourse);


// Тільки авторизовані
router.post('/', protect, createCourse);
router.put('/:id', protect, updateCourse);


// Тільки адмін
router.delete('/:id', protect, restrictTo('admin'), deleteCourse);

module.exports = router;