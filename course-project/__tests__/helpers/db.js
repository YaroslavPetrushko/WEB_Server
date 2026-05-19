// __tests__/helpers/db.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

module.exports = {
    connect: async () => {
        mongod = await MongoMemoryServer.create();
        await mongoose.connect(mongod.getUri());
    },
    disconnect: async () => {
        await mongoose.disconnect();
        await mongod.stop();
    },
    // Очистити всі колекції між тестами
    clear: async () => {
        await Promise.all(
            Object.values(mongoose.connection.collections).map(c => c.deleteMany({}))
        );
    }
};