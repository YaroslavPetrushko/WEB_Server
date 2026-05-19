const request = require('supertest');
const app = require('../app');
const db = require('./helpers/db');
const factory = require('./helpers/factory');

beforeAll(db.connect);
afterAll(db.disconnect);
afterEach(db.clear);

describe('GET /api/courses', () => {
    it('повертає список курсів з пагінацією', async () => {
        const user = await factory.user();
        await factory.course(user._id);
        await factory.course(user._id);

        const res = await request(app).get('/api/courses');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(2);
        expect(res.body.pagination).toMatchObject({
            total: 2, page: 1
        });
    });

    it('фільтрує курси за instructor (регістронезалежно)', async () => {
        const user = await factory.user();
        await factory.course(user._id, { instructor: 'John Smith' });
        await factory.course(user._id, { instructor: 'Jane Doe' });

        const res = await request(app).get('/api/courses?instructor=john');

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].instructor).toBe('John Smith');
    });

    it('фільтрує курси за title', async () => {
        const user = await factory.user();
        await factory.course(user._id, { title: 'JavaScript Advanced' });
        await factory.course(user._id, { title: 'Python Basics' });

        const res = await request(app).get('/api/courses?title=javascript');

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
    });

    it('повертає порожній масив якщо курсів немає', async () => {
        const res = await request(app).get('/api/courses');
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(0);
    });
});

describe('GET /api/courses/:id', () => {
    it('повертає курс за id', async () => {
        const user = await factory.user();
        const course = await factory.course(user._id, { title: 'My Course' });

        const res = await request(app).get(`/api/courses/${course._id}`);

        expect(res.status).toBe(200);
        expect(res.body.data.title).toBe('My Course');
    });

    it('повертає 404 для неіснуючого id', async () => {
        const fakeId = '507f1f77bcf86cd799439011';
        const res = await request(app).get(`/api/courses/${fakeId}`);
        expect(res.status).toBe(404);
    });
});

describe('POST /api/courses', () => {
    const validCourse = {
        title: 'New Course',
        description: 'Course description long enough',
        instructor: 'John Doe',
        price: 200,
        duration: 10
    };

    it('авторизований користувач може створити курс', async () => {
        const user = await factory.user();

        const res = await request(app)
            .post('/api/courses')
            .set(factory.auth(user))
            .send(validCourse);

        expect(res.status).toBe(201);
        expect(res.body.data.title).toBe(validCourse.title);
        expect(res.body.data.createdBy).toBe(user._id.toString());
    });

    it('неавторизований запит повертає 401', async () => {
        const res = await request(app).post('/api/courses').send(validCourse);
        expect(res.status).toBe(401);
    });

    it('повертає 400 при відсутності обовʼязкових полів', async () => {
        const user = await factory.user();

        const res = await request(app)
            .post('/api/courses')
            .set(factory.auth(user))
            .send({ title: 'No description' });

        expect(res.status).toBe(400);
    });

    it('повертає 400 при від\'ємній ціні', async () => {
        const user = await factory.user();

        const res = await request(app)
            .post('/api/courses')
            .set(factory.auth(user))
            .send({ ...validCourse, price: -10 });

        expect(res.status).toBe(400);
    });
});

describe('PUT /api/courses/:id', () => {
    it('власник може оновити свій курс', async () => {
        const user = await factory.user();
        const course = await factory.course(user._id);

        const res = await request(app)
            .put(`/api/courses/${course._id}`)
            .set(factory.auth(user))
            .send({ title: 'Updated Title' });

        expect(res.status).toBe(200);
        expect(res.body.data.title).toBe('Updated Title');
    });

    it('інший користувач отримує 403', async () => {
        const owner = await factory.user();
        const other = await factory.user();
        const course = await factory.course(owner._id);

        const res = await request(app)
            .put(`/api/courses/${course._id}`)
            .set(factory.auth(other))
            .send({ title: 'Hacked Title' });

        expect(res.status).toBe(403);
    });

    it('адмін може оновити будь-який курс', async () => {
        const owner = await factory.user();
        const admin = await factory.admin();
        const course = await factory.course(owner._id);

        const res = await request(app)
            .put(`/api/courses/${course._id}`)
            .set(factory.auth(admin))
            .send({ title: 'Admin Updated' });

        expect(res.status).toBe(200);
        expect(res.body.data.title).toBe('Admin Updated');
    });
});

describe('DELETE /api/courses/:id', () => {
    it('адмін може видалити курс', async () => {
        const user = await factory.user();
        const admin = await factory.admin();
        const course = await factory.course(user._id);

        const res = await request(app)
            .delete(`/api/courses/${course._id}`)
            .set(factory.auth(admin));

        expect(res.status).toBe(200);

        // Перевірити що курс справді видалений
        const check = await request(app).get(`/api/courses/${course._id}`);
        expect(check.status).toBe(404);
    });

    it('звичайний користувач отримує 403', async () => {
        const user = await factory.user();
        const course = await factory.course(user._id);

        const res = await request(app)
            .delete(`/api/courses/${course._id}`)
            .set(factory.auth(user));

        expect(res.status).toBe(403);
    });
});