// controllers/commentController.js
const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Post = require('../models/Post');

// ==================== CREATE ====================
exports.createComment = async (req, res) => {
    try {
        const { postId, author, content } = req.body;

        // Перевіряємо чи існує пост
        const postExists = await Post.findById(postId);
        if (!postExists) {
            return res.status(404).json({
                success: false,
                message: 'Пост не знайдено',
                errors: [{ field: "postId", message: "Post with given ID does not exist" }]
            });
        }

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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            errors: []
        });
    }
};

// ==================== READ ====================
exports.getCommentsByPost = async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.postId })
            .sort({ createdAt: -1 })
            .populate('post', 'title');

        res.status(200).json({
            success: true,
            count: comments.length,
            data: comments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            errors: []
        });
    }
};

// ==================== UPDATE ====================
exports.updateComment = async (req, res) => {
    try {
        const { content } = req.body;

        const comment = await Comment.findByIdAndUpdate(
            req.params.id,
            { content },
            { new: true, runValidators: true }
        );

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Коментар не знайдено',
                errors: [{ field: "id", message: "Comment with given ID does not exist" }]
            });
        }

        res.status(200).json({
            success: true,
            data: comment,
            message: 'Коментар оновлено'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            errors: []
        });
    }
};

// ==================== DELETE ====================
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Коментар не знайдено',
                errors: [{ field: "id", message: "Comment with given ID does not exist" }]
            });
        }

        await comment.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Коментар видалено'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            errors: [] 
        });
    }
};