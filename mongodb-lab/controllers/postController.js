// controllers/postController.js
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// ==================== CREATE ====================
// Створення нового поста
exports.createPost = async (req, res) => {
    try {
        const { title, content, author, tags } = req.body;

        const post = await Post.create({
            title,
            content,
            author,
            tags: tags || []
        });

        res.status(201).json({
            success: true,
            data: post,
            message: 'Пост успішно створено'
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
// Отримання всіх постів з пагінацією, фільтрацією та сортуванням
// 
// Query параметри:
//   page      - номер сторінки (default: 1)
//   limit     - постів на сторінку (default: 10)
//   author    - фільтр за автором (?author=John)
//   tags      - фільтр за тегами, через кому (?tags=js,node)
//   sortBy    - поле сортування: createdAt | likes | title (default: createdAt)
//   order     - напрямок: asc | desc (default: desc)
exports.getAllPosts = async (req, res) => {
    try {
        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1) * limit;

        // Фільтрація
        const filter = {};

         if (req.query.author) {
            // Регістронезалежний пошук по автору
            filter.author = { $regex: req.query.author, $options: 'i' };
        }

        if (req.query.tags) {
            // Підтримка кількох тегів: ?tags=javascript,node
            const tagsArray = req.query.tags.split(',').map(t => t.trim());
            // $in — пост має містити хоча б один з тегів
            filter.tags = { $in: tagsArray };
        }

        // --- Сортування ---
        const allowedSortFields = ['createdAt', 'likes', 'title', 'updatedAt'];
        const sortBy = allowedSortFields.includes(req.query.sortBy)
            ? req.query.sortBy
            : 'createdAt';
        const order = req.query.order === 'asc' ? 1 : -1;
        const sortOptions = { [sortBy]: order };

        // --- Запит ---
        const posts = await Post.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);

        const total = await Post.countDocuments();

    // --- Підрахунок кількості коментарів для кожного поста ---
    // aggregation: групуємо Comment за полем post, рахуємо кількість
        const commentCounts = await Comment.aggregate([
            { $match: { post: { $in: posts.map(p => p._id) } } },
            { $group: { _id: '$post', count: { $sum: 1 } } }
        ]);

        // Перетворюємо масив у Map
        const countMap = new Map(
            commentCounts.map(({ _id, count }) => [_id.toString(), count])
        );

        // Додаємо commentCount до кожного поста у відповіді
        const postsWithCommentCount = posts.map(post => ({
            ...post.toObject(),
            commentCount: countMap.get(post._id.toString()) || 0
        }));

        res.status(200).json({
            success: true,
            count: posts.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: posts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            errors: []
        });
    }
};

// Отримання одного поста з коментарями
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Пост не знайдено',
                errors: [{ field: "id", message: "Post with given ID does not exist" }]
            });
        }

        // Отримуємо коментарі до цього поста
        const comments = await Comment.find({ post: post._id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                ...post.toObject(),
                commentCount: comments.length,
                comments
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            errors: []
        });
    }
};

// Пошук постів за текстом
exports.searchPosts = async (req, res) => {
    try {
        const { q } = req.query;

        const posts = await Post.find(
            { $text: { $search: q } },
            { score: { $meta: 'textScore' } }
        ).sort({ score: { $meta: 'textScore' } });

        res.status(200).json({
            success: true,
            count: posts.length,
            data: posts
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
// Оновлення поста
exports.updatePost = async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            {
                title,
                content,
                tags,
                updatedAt: Date.now()
            },
            {
                new: true, // Повернути оновлений документ
                runValidators: true // Запустити валідатори схеми
            }
        );

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Пост не знайдено',
                errors: [{ field: "id", message: "Post with given ID does not exist" }]
            });
        }

        res.status(200).json({
            success: true,
            data: post,
            message: 'Пост успішно оновлено'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            errors: []
        });
    }
};

// Збільшення лічильника лайків
exports.likePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.id,
                { $inc: { likes: 1 } }, // Оператор $inc для збільшення
                { new: true }
            );

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Пост не знайдено',
                errors: [{ field: "id", message: "Post with given ID does not exist" }]
            });
        }

        res.status(200).json({
            success: true,
            data: post,
            message: 'Лайк додано'
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
// Видалення поста та всіх його коментарів
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Пост не знайдено',
                errors: [{ field: "id", message: "Post with given ID does not exist" }] 
            });
        }

        // Видаляємо всі коментарі цього поста (каскадне видалення)
        const { deletedCount } = await Comment.deleteMany({ post: req.params.id });

        // Видаляємо сам пост
        await post.deleteOne();

        res.status(200).json({
            success: true,
            message: `Пост та всі коментарі видалено. Також видалено коментарів: ${deletedCount}`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            errors: []
        });
    }
};

