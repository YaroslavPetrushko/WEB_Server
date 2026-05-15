const catchAsync = require('../utils/catchAsync');
const enrollmentService = require('../services/enrollmentService');

exports.enroll = catchAsync(async (req, res) => {
    const enrollment = await enrollmentService.enrollUser(req.user._id, req.params.id);

    res.status(201).json({
        success: true,
        message: 'Successfully enrolled in course',
        data: enrollment
    });
});

exports.unenroll = catchAsync(async (req, res) => {
    await enrollmentService.unenrollUser(req.user._id, req.params.id);

    res.status(200).json({
        success: true,
        message: 'Successfully unenrolled from course',
        data: null
    });
});

exports.getMyEnrollments = catchAsync(async (req, res) => {
    const enrollments = await enrollmentService.getUserEnrollments(req.user._id);

    res.status(200).json({
        success: true,
        count: enrollments.length,
        data: enrollments
    });
});

// Статус запису для конкретного курсу (для клієнта — показати кнопку "Записатись" чи "Відписатись")
exports.getEnrollmentStatus = catchAsync(async (req, res) => {
    const isEnrolled = await enrollmentService.checkEnrollment(req.user._id, req.params.id);

    res.status(200).json({
        success: true,
        data: { isEnrolled }
    });
});