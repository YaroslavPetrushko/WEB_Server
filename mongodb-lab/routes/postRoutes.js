// routes/postRoutes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.post('/', postController.createPost);
router.get('/', postController.getAllPosts);
router.get('/search', postController.searchPosts);
router.get('/:id', postController.getPostById);
router.put('/:id', postController.updatePost);
router.patch('/:id/like', postController.likePost);
router.delete('/:id', postController.deletePost);

module.exports = router;