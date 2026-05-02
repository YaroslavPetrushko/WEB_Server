// services/courseService.js
const Course = require('../models/Course');
const AppError = require('../utils/AppError');

// Отримати всі курси з фільтрацією та пагінацією (публічний)
// Параметри (всі необов'язкові, є дефолти):
//   instructor — рядок для пошуку по полю instructor (часткове співпадіння)
//   page       — номер сторінки (за замовчуванням 1)
//   limit      — кількість записів на сторінку (за замовчуванням 10, максимум 50)
//
// Приклади запитів:
//   GET /api/courses                          → всі курси, сторінка 1
//   GET /api/courses?page=2&limit=5           → 5 курсів, сторінка 2
//   GET /api/courses?instructor=John          → курси з "John" в імені викладача
//   GET /api/courses?instructor=John&page=1&limit=3
exports.getAllCourses = async ({ instructor, page = 1, limit = 10 } = {}) => {
 
    // Фільтрація
    const filter = {};

     if (instructor) {
        // $regex — пошук підрядка (не точне співпадіння).
        // $options: 'i' — регістронезалежний пошук (John = john = JOHN).
        filter.instructor = { $regex: instructor, $options: 'i' };
    }
 
    // Пагінація
    const pageNum = Math.max(1, parseInt(page));   // мінімум 1
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10)); // Діапазон 1..50
    const skip = (pageNum - 1) * limitNum; // скільки документів пропустити
 
    // countDocuments() — підраховує загальну кількість (з фільтром, без пагінації).
    const total = await Course.countDocuments(filter);

    const courses = await Course.find(filter)
        .populate('createdBy', 'name email')
        .skip(skip)         // пропустити перші N документів
        .limit(limitNum);   // повернути не більше limitNum документів
 
    // Повертаємо дані та мета-інформацію для клієнта
    return {
        courses,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum) 
        }
    }; 
};

// Отримати один курс за id (публічний)
exports.getCourseById = async (id) => {
    const course = await Course.findById(id).populate('createdBy', 'name email');

    if (!course) throw new AppError('Course not found', 404);

    return course;
};

// Створити курс (тільки авторизований)
exports.createCourse = async (data, userId) => {
    return await Course.create({ ...data, createdBy: userId });
};

// Оновити курс (тільки авторизований)
exports.updateCourse = async (id, data, currentUser) => {
    const course = await Course.findById(id);
    if (!course) throw new AppError('Course not found', 404);

    // Перевірка власника
    const isOwner = course.createdBy.toString() === currentUser._id.toString();
    const isAdmin = currentUser.role === 'admin';
 
    // Якщо користувач не є власником і не є адміном — заборонити оновлення
    if (!isOwner && !isAdmin) {
        throw new AppError('You do not have permission to update this course', 403);
    }

    Object.assign(course, data);
    await course.save();

    return course;
};

// Видалити курс (тільки admin)
exports.deleteCourse = async (id) => {
    const course = await Course.findByIdAndDelete(id);
    if (!course) throw new AppError('Course not found', 404);
    return course;
};