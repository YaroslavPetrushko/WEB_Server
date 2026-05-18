const express = require('express');
const router = express.Router({ mergeParams: true });
const protect = require('../middleware/protect');
const validate = require('../validators/validate');
const { createReviewSchema } = require('../validators/reviewValidator');
const { getReviews, createReview, deleteReview } = require('../controllers/reviewController');


// GET /api/courses/:courseId/reviews - отримати всі відгуки для курсу (публічний)
router.get('/', getReviews);

// POST /api/courses/:courseId/reviews - створити відгук для курсу (авторизований)
router.post('/', protect, validate(createReviewSchema), createReview);

// DELETE /api/courses/:courseId/reviews/:id - видалити відгук (автор або admin)
router.delete('/:id', protect, deleteReview);

module.exports = router;