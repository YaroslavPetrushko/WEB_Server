// courseplatform-client/config.js
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'                      // Якщо розробка локальна
    : 'https://course-platform-lmyi.onrender.com'; // URL бекенду на Render