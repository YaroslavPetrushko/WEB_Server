const request = require('supertest');
const app = require('../app');
const db = require('./helpers/db');
const factory = require('./helpers/factory');

beforeAll(db.connect);
afterAll(db.disconnect);
afterEach(db.clear);

describe('POST /api/courses/:id/enroll', () => {
    it('авторизований користувач може записатись на курс', async () => {
        const user = await factory.user();
        const course = await factory.course(user._id);

        const res = await request(app)
            .post(`/api/courses/${course._id}/enroll`)
            .set(factory.auth(user));

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
    });

    it('повертає 409 при повторному записі на той самий курс', async () => {
        const user = await factory.user();
        const course = await factory.course(user._id);

        await request(app)
            .post(`/api/courses/${course._id}/enroll`)
            .set(factory.auth(user));

        const res = await request(app)
            .post(`/api/courses/${course._id}/enroll`)
            .set(factory.auth(user));

        expect(res.status).toBe(409);
    });

    it('повертає 404 для неіснуючого курсу', async () => {
        const user = await factory.user();
        const fakeId = '507f1f77bcf86cd799439011';

        const res = await request(app)
            .post(`/api/courses/${fakeId}/enroll`)
            .set(factory.auth(user));

        expect(res.status).toBe(404);
    });

    it('повертає 401 без авторизації', async () => {
        const user = await factory.user();
        const course = await factory.course(user._id);

        const res = await request(app).post(`/api/courses/${course._id}/enroll`);
        expect(res.status).toBe(401);
    });
});

describe('DELETE /api/courses/:id/enroll', () => {
    it('користувач може відписатись від курсу', async () => {
        const user = await factory.user();
        const course = await factory.course(user._id);

        await request(app)
            .post(`/api/courses/${course._id}/enroll`)
            .set(factory.auth(user));

        const res = await request(app)
            .delete(`/api/courses/${course._id}/enroll`)
            .set(factory.auth(user));

        expect(res.status).toBe(200);
    });

    it('повертає 404 якщо запису не існує', async () => {
        const user = await factory.user();
        const course = await factory.course(user._id);

        const res = await request(app)
            .delete(`/api/courses/${course._id}/enroll`)
            .set(factory.auth(user));

        expect(res.status).toBe(404);
    });
});

describe('GET /api/auth/me/courses', () => {
    it('повертає список записів поточного користувача', async () => {
        const user = await factory.user();
        const course1 = await factory.course(user._id);
        const course2 = await factory.course(user._id);

        await request(app)
            .post(`/api/courses/${course1._id}/enroll`)
            .set(factory.auth(user));
        await request(app)
            .post(`/api/courses/${course2._id}/enroll`)
            .set(factory.auth(user));

        const res = await request(app)
            .get('/api/auth/me/courses')
            .set(factory.auth(user));

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(2);
    });
});

describe('GET /api/courses/:id/enrollment-status', () => {
    it('повертає isEnrolled: true якщо записаний', async () => {
        const user = await factory.user();
        const course = await factory.course(user._id);

        await request(app)
            .post(`/api/courses/${course._id}/enroll`)
            .set(factory.auth(user));

        const res = await request(app)
            .get(`/api/courses/${course._id}/enrollment-status`)
            .set(factory.auth(user));

        expect(res.status).toBe(200);
        expect(res.body.data.isEnrolled).toBe(true);
    });

    it('повертає isEnrolled: false якщо не записаний', async () => {
        const user = await factory.user();
        const course = await factory.course(user._id);

        const res = await request(app)
            .get(`/api/courses/${course._id}/enrollment-status`)
            .set(factory.auth(user));

        expect(res.body.data.isEnrolled).toBe(false);
    });
});