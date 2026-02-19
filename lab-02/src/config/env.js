const path = require('path');
require('dotenv').config();
const ROOT_DIR = path.join(__dirname, '..', '..');
module.exports = {
PORT: process.env.PORT || 3000,
LOG_PATH: path.join(
ROOT_DIR,
process.env.LOG_DIR || 'logs',
process.env.LOG_FILE || 'requests-v2.log'
),
PUBLIC_DIR: path.join(
ROOT_DIR,
process.env.PUBLIC_DIR || 'public'
)
};