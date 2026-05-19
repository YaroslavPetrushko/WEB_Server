// course-project/jest.config.js
module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.js'],
    setupFiles: ['<rootDir>/__tests__/env.js'],  // env до імпорту модулів
    testTimeout: 30000,
    verbose: true
};