// controllers/commentController.js
const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const ApiError = require('../errors/ApiError');
const asyncHandler = require('../middlewares/asyncHandler');

// ==================== CREATE ====================
exports.createComment = asyncHandler(async (req, res) => {
        const { postId, author, content } = req.body;

        // Перевіряємо чи існує пост
        const postExists = await Post.findById(postId);
        if (!postExists) throw ApiError.notFound('Пост не знайдено');

        const comment = await Comment.create({
            post: postId,
            author,
            content
        });

        res.status(201).json({
            success: true,
            data: comment,
            message: 'Коментар додано'
        });
});

// ==================== READ ====================
exports.getCommentsByPost = asyncHandler(async (req, res) => {
        const comments = await Comment.find({ post: req.params.postId })
            .sort({ createdAt: -1 })
            .populate('post', 'title');

        res.status(200).json({
            success: true,
            count: comments.length,
            data: comments
        });
});

// ==================== UPDATE ====================
exports.updateComment = asyncHandler(async (req, res) => {
        const { content } = req.body;

        const comment = await Comment.findByIdAndUpdate(
            req.params.id,
            { content },
            { new: true, runValidators: true }
        );

        if (!comment) {
            throw ApiError.notFound('Коментар не знайдено');
        }

        res.status(200).json({
            success: true,
            data: comment,
            message: 'Коментар оновлено'
        });
});

// ==================== DELETE ====================
exports.deleteComment = asyncHandler(async (req, res) => {
        const comment = await Comment.findById(req.params.id);

        if (!comment) throw ApiError.notFound('Коментар не знайдено');

        await comment.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Коментар видалено'
        });
});