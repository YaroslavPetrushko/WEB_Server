const request = require('supertest');
const app = require('../app');
const db = require('./helpers/db');
const factory = require('./helpers/factory');

beforeAll(db.connect);
afterAll(db.disconnect);
afterEach(db.clear);

const validReview = { rating: 4, comment: 'Great course, highly recommend it!' };

describe('GET /api/courses/:courseId/reviews', () => {
    it('публічно повертає відгуки курсу', async () => {
        const user = await factory.user();
        const course = await factory.course(user._id);

        await request(app)
            .post(`/api/courses/${course._id}/reviews`)
            .set(factory.auth(user))
            .send(validReview);

        const res = await request(app).get(`/api/courses/${course._id}/reviews`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].rating).toBe(validReview.rating);
        expect(res.body.data[0].user.name).toBeDefined();
    });
});

describe('POST /api/courses/:courseId/reviews', () => {
    it('авторизований користувач може залишити відгук', async () => {
        const user = await factory.user();
        const course = await factory.course(user._id);

        const res = await request(app)
            .post(`/api/courses/${course._id}/reviews`)
            .set(factory.auth(user))
            .send(validReview);

        expect(res.status).toBe(201);
        expect(res.body.data.rating).toBe(validReview.rating);
    });

    it('повертає 400 при повторному відгуку на той самий курс', async () => {
        const user = await factory.user();
        const course = await factory.course(user._id);

        await request(app)
            .post(`/api/courses/${course._id}/reviews`)
            .set(factory.auth(user))
            .send(validReview);

        const res = await request(app)
            .post(`/api/courses/${course._id}/reviews`)
            .set(factory.auth(user))
            .send(validReview);

        expect(res.status).toBe(400);
    });

    it('повертає 400 при рейтингу поза межами 1–5', async () => {
        const user = await factory.user();
        const course = await factory.course(user._id);

        const res = await request(app)
            .post(`/api/courses/${course._id}/reviews`)
            .set(factory.auth(user))
            .send({ ...validReview, rating: 6 });

        expect(res.status).toBe(400);
    });

    it('повертає 401 без авторизації', async () => {
        const user = await factory.user();
        const course = await factory.course(user._id);

        const res = await request(app)
            .post(`/api/courses/${course._id}/reviews`)
            .send(validReview);

        expect(res.status).toBe(401);
    });
});

describe('DELETE /api/courses/:courseId/reviews/:id', () => {
    it('автор може видалити свій відгук', async () => {
        const user = await factory.user();
        const course = await factory.course(user._id);

        const created = await request(app)
            .post(`/api/courses/${course._id}/reviews`)
            .set(factory.auth(user))
            .send(validReview);

        const reviewId = created.body.data._id;

        const res = await request(app)
            .delete(`/api/courses/${course._id}/reviews/${reviewId}`)
            .set(factory.auth(user));

        expect(res.status).toBe(200);
    });

    it('інший користувач отримує 403', async () => {
        const author = await factory.user();
        const other = await factory.user();
        const course = await factory.course(author._id);

        const created = await request(app)
            .post(`/api/courses/${course._id}/reviews`)
            .set(factory.auth(author))
            .send(validReview);

        const reviewId = created.body.data._id;

        const res = await request(app)
            .delete(`/api/courses/${course._id}/reviews/${reviewId}`)
            .set(factory.auth(other));

        expect(res.status).toBe(403);
    });

    it('адмін може видалити будь-який відгук', async () => {
        const author = await factory.user();
        const admin = await factory.admin();
        const course = await factory.course(author._id);

        const created = await request(app)
            .post(`/api/courses/${course._id}/reviews`)
            .set(factory.auth(author))
            .send(validReview);

        const reviewId = created.body.data._id;

        const res = await request(app)
            .delete(`/api/courses/${course._id}/reviews/${reviewId}`)
            .set(factory.auth(admin));

        expect(res.status).toBe(200);
    });
});