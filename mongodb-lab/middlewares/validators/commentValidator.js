// middlewares/validators/commentValidator.js
const { body, param } = require('express-validator');

exports.createCommentRules = [
    body('postId').notEmpty().withMessage('postId is required')
     .isMongoId().withMessage('invalid postId'),
    body('author').trim().notEmpty().withMessage('author is required')
     .isLength({ min: 2, max: 100 }).withMessage('author length must be 2-100'),
    body('content').trim().notEmpty().withMessage('content is required')
     .isLength({ min: 1, max: 1000 }).withMessage('content length must be 1-1000')
];

exports.updateCommentRules = [
    param('id').isMongoId().withMessage('invalid comment id'),
    body('content').trim().notEmpty().withMessage('content is required')
     .isLength({ min: 1, max: 1000 }).withMessage('content length must be 1-1000')
];

exports.deleteCommentRules = [
    param('id').isMongoId().withMessage('invalid comment id')
];

exports.postIdParamRules = [
    param('postId').isMongoId().withMessage('invalid postId')
];