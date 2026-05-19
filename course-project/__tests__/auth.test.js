const request = require('supertest');
const app = require('../app');
const db = require('./helpers/db');

beforeAll(db.connect);
afterAll(db.disconnect);
afterEach(db.clear);

const validUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password1',
    confirmPassword: 'Password1'
};

describe('POST /api/auth/register', () => {
    it('реєструє користувача та повертає 201 без пароля у відповіді', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(validUser);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.user.email).toBe(validUser.email);
        expect(res.body.data.user.password).toBeUndefined();
    });

    it('встановлює httpOnly cookie після реєстрації', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(validUser);

        const cookie = res.headers['set-cookie']?.[0] ?? '';
        expect(cookie).toMatch(/token=/);
        expect(cookie).toMatch(/HttpOnly/i);
    });

    it('повертає 409 при дублікаті email', async () => {
        await request(app).post('/api/auth/register').send(validUser);
        const res = await request(app).post('/api/auth/register').send(validUser);

        expect(res.status).toBe(409);
    });

    it('повертає 400 при невалідному email', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ ...validUser, email: 'not-an-email' });

        expect(res.status).toBe(400);
    });

    it('повертає 400 якщо паролі не збігаються', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ ...validUser, confirmPassword: 'Different9' });

        expect(res.status).toBe(400);
    });

    it('повертає 400 якщо пароль не містить цифри', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ ...validUser, password: 'onlyletters', confirmPassword: 'onlyletters' });

        expect(res.status).toBe(400);
    });
});

describe('POST /api/auth/login', () => {
    beforeEach(async () => {
        await request(app).post('/api/auth/register').send(validUser);
    });

    it('успішний вхід повертає 200 і встановлює cookie', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: validUser.email, password: validUser.password });

        expect(res.status).toBe(200);
        expect(res.body.data.user.email).toBe(validUser.email);
        expect(res.headers['set-cookie']?.[0]).toMatch(/token=/);
    });

    it('повертає 401 при невірному паролі', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: validUser.email, password: 'WrongPass9' });

        expect(res.status).toBe(401);
    });

    it('повертає 401 при неіснуючому email', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'nobody@example.com', password: 'Password1' });

        expect(res.status).toBe(401);
    });
});

describe('GET /api/auth/me', () => {
    it('повертає профіль користувача з валідним cookie', async () => {
        // agent зберігає cookie між запитами
        const agent = request.agent(app);
        await agent.post('/api/auth/register').send(validUser);

        const res = await agent.get('/api/auth/me');

        expect(res.status).toBe(200);
        expect(res.body.data.user.email).toBe(validUser.email);
        expect(res.body.data.user.password).toBeUndefined();
    });

    it('повертає 401 без токена', async () => {
        const res = await request(app).get('/api/auth/me');
        expect(res.status).toBe(401);
    });
});

describe('POST /api/auth/logout', () => {
    it('очищає cookie і повертає 200', async () => {
        const agent = request.agent(app);
        await agent.post('/api/auth/register').send(validUser);

        const res = await agent.post('/api/auth/logout');
        expect(res.status).toBe(200);

        // Після logout /me повинен повернути 401
        const meRes = await agent.get('/api/auth/me');
        expect(meRes.status).toBe(401);
    });
});