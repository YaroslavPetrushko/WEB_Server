// __tests__/helpers/factory.js
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Course = require('../../models/Course');

let seq = 0; // унікальний лічильник в рамках test run

const factory = {
    async user(overrides = {}) {
        seq++;
        return User.create({
            name: `User ${seq}`,
            email: `user${seq}@test.com`,
            password: 'Password1',
            role: 'user',
            ...overrides
        });
    },

    async admin(overrides = {}) {
        return this.user({ role: 'admin', ...overrides });
    },

    // Генерує JWT напряму — тести не залежать від /login
    token(user) {
        return jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
    },

    auth(user) {
        return { Authorization: `Bearer ${this.token(user)}` };
    },

    async course(userId, overrides = {}) {
        seq++;
        return Course.create({
            title: `Course ${seq}`,
            description: 'Test course description long enough',
            instructor: 'Test Instructor',
            price: 100,
            duration: 5,
            createdBy: userId,
            ...overrides
        });
    }
};

module.exports = factory;