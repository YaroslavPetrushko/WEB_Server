const Review = require('../models/Review');
const AppError = require('../utils/AppError');

exports.getReviewsByCourse = async (courseId) => {
  return await Review.find({ course: courseId })
    .populate('user', 'name');
};

exports.createReview = async (data, courseId, userId) => {
  try {
    return await Review.create({
      ...data,
      course: courseId,
      user: userId
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError('You have already reviewed this course', 400);
    }
    throw err;
  }
};

exports.deleteReview = async (reviewId, currentUser) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new AppError('Review not found', 404);
  if (
    review.user.toString() !== currentUser._id.toString() &&
    currentUser.role !== 'admin'
  ) {
    throw new AppError('You do not have permission to delete this review', 403);
  }
  await review.deleteOne();
  return review;
};