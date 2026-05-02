// controllers/courseController.js
const catchAsync = require('../utils/catchAsync');
const courseService = require('../services/courseService');

// GET /api/courses — всі курси з пагінацією та фільтрацією (публічний)
exports.getAllCourses = catchAsync (async(req, res) => {
    const { page, limit, instructor } = req.query;
 
    const { courses, pagination } = await courseService.getAllCourses({
        instructor,
        page,
        limit
    });

    res.status(200).json({
        success: true,
        count: courses.length,
        pagination,
        data: courses
    });
});


// GET /api/courses/:id — отримати один курс (публічний)
exports.getCourse = catchAsync (async(req, res) => {
    const course = await courseService.getCourseById(req.params.id);

    res.status(200).json({
        success: true,
        data: course
    });
});


// POST /api/courses — створити курс (тільки авторизований)
exports.createCourse = catchAsync (async(req, res) => {
    const course = await courseService.createCourse(req.body, req.user._id);

    res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: course
    });
});


// PUT /api/courses/:id — оновити курс (тільки авторизований)
exports.updateCourse = catchAsync (async(req, res) => {
    const course = await courseService.updateCourse(req.params.id, req.body, req.user);

    res.status(200).json({
        success: true,
        message: 'Course updated successfully',
        data: course
    });
});


// DELETE /api/courses/:id — видалити курс (тільки admin)
exports.deleteCourse = catchAsync (async(req, res) => {
   await courseService.deleteCourse(req.params.id);

    res.status(200).json({
        success: true,
        message: 'Course deleted successfully',
        data: null
    });
});