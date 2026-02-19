const fs = require('fs');
const path = require('path');
const { LOG_PATH } = require('../config/env');

const dir = path.dirname(LOG_PATH);

if (!fs.existsSync(dir)) {
fs.mkdirSync(dir, { recursive: true });
}

function log(data) {
const logEntry = JSON.stringify(data) + '\n';

    fs.appendFile(LOG_PATH, logEntry, (err) => {
        if (err) {
            console.error('Error writing log:', err);
        }
    });
}

module.exports = { log };