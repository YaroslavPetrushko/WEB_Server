// middlewares/validators/postValidator.js
const { body, param, query } = require('express-validator');

exports.createPostRules = [
    body('title').trim().notEmpty().withMessage('title is required')
     .isLength({ min: 3, max: 200 }).withMessage('title length must be 3-200'),
    body('content').trim().notEmpty().withMessage('content is required')
     .isLength({ min: 10 }).withMessage('content min length is 10'),
    body('author').trim().notEmpty().withMessage('author is required')
     .isLength({ min: 2, max: 100 }).withMessage('author length must be 2-100'),
    body('tags').optional().isArray({ max: 10 }).withMessage('max 10 tags allowed'),
    body('tags.*').optional().isString().withMessage('each tag must be a string').trim()
];

exports.updatePostRules = [
    param('id').isMongoId().withMessage('invalid post id'),
    body('title').optional().trim()
     .isLength({ min: 3, max: 200 }).withMessage('title length must be 3-200'),
    body('content').optional().trim()
     .isLength({ min: 10 }).withMessage('content min length is 10'),
    body('tags').optional().isArray({ max: 10 }).withMessage('max 10 tags allowed'),
    body('tags.*').optional().isString().withMessage('each tag must be a string').trim()
];

exports.getPostsRules = [
    query('page').optional().toInt().isInt({ min: 1 }).withMessage('page must be >= 1'),
    query('limit').optional().toInt().isInt({ min: 1, max: 100 }).withMessage('limit must be 1-100')
];

exports.searchPostsRules = [
    query('q').trim().notEmpty().withMessage('q is required')
     .isLength({ min: 2 }).withMessage('q min length is 2')
];

exports.mongoIdParamRule = [
    param('id').optional()
];