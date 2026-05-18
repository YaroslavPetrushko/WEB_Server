const catchAsync = require('../utils/catchAsync');
const reviewService = require('../services/reviewService');

exports.getReviews = catchAsync(async (req, res) => {
  const reviews = await reviewService.getReviewsByCourse(req.params.courseId);
  res.status(200).json({ success: true, count: reviews.length, data: reviews });
});

exports.createReview = catchAsync(async (req, res) => {
  const review = await reviewService.createReview(
    req.body,
    req.params.courseId,
    req.user._id
  );
  res.status(201).json({ success: true, data: review });
});

exports.deleteReview = catchAsync(async (req, res) => {
  await reviewService.deleteReview(req.params.id, req.user);
  res.status(200).json({ success: true, message: 'Відгук видалено' });

});