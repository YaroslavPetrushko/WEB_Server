// controllers/postController.js
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const ApiError = require('../errors/ApiError');
const asyncHandler = require('../middlewares/asyncHandler');

// ==================== CREATE ====================
// Створення нового поста
exports.createPost = asyncHandler(async (req, res) => {
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
});

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
exports.getAllPosts = asyncHandler(async (req, res) => {
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
});

// Отримання одного поста з коментарями
exports.getPostById = asyncHandler(async (req, res) => {
        const post = await Post.findById(req.params.id);
          
        if (!post) throw ApiError.notFound('Пост не знайдено');

        // Отримуємо коментарі до цього поста
        const comments = await Comment.find({ post: post._id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: { post, comments}
        });
});

// Пошук постів за текстом
exports.searchPosts = asyncHandler(async (req, res) => {

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
});

// ==================== UPDATE ====================
// Оновлення поста
exports.updatePost = asyncHandler(async (req, res) => {

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

        if (!post) throw ApiError.notFound('Пост не знайдено');

        res.status(200).json({
            success: true,
            data: post,
            message: 'Пост успішно оновлено'
        });
});

// Збільшення лічильника лайків
exports.likePost = asyncHandler(async (req, res) => {
    const post = await Post.findByIdAndUpdate(
            req.params.id,
                { $inc: { likes: 1 } }, // Оператор $inc для збільшення
                { new: true }
            );

        if (!post) throw ApiError.notFound('Пост не знайдено');            
        //else throw ApiError.internal('Помилка при додаванні лайку'); // Штучна помилка для тестування errorHandler на статус 500

        res.status(200).json({
            success: true,
            data: post,
            message: 'Лайк додано'
        });
});

// ==================== DELETE ====================
// Видалення поста та всіх його коментарів
exports.deletePost = asyncHandler(async (req, res) => {
        const post = await Post.findById(req.params.id);

        if (!post) throw ApiError.notFound('Пост не знайдено');

        // Видаляємо всі коментарі цього поста (каскадне видалення)
        const { deletedCount } = await Comment.deleteMany({ post: req.params.id });

        // Видаляємо сам пост
        await post.deleteOne();

        res.status(200).json({
            success: true,
            message: `Пост та всі коментарі видалено. Також видалено коментарів: ${deletedCount}`
        });
});

