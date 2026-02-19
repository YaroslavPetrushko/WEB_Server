const http = require('http');
const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');
const { getContentType } = require('./utils/contentType');
const {PORT, PUBLIC_DIR} = require('./config/env');

const server = http.createServer((req,res)=>{
    
    const start=Date.now();
    let filePath;
    
    if (req.url === '/') {   
        filePath = path.join(PUBLIC_DIR, 'index.html');
    } 
    else if (req.url === '/about') {
        filePath = path.join(PUBLIC_DIR, 'about.html');
    } 
    else {
        res.statusCode = 404;
       filePath=path.join(PUBLIC_DIR, req.url);
    }

    fs.readFile(filePath, (err, content) => {
     if (err) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('Not found');
        return;
     }

    res.statusCode = 200;
    res.setHeader('Content-Type', getContentType(filePath));
    res.end(content);
});

    res.on('finish', () => {
        const end = Date.now();

        logger.log({
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            timestamp: new Date().toISOString(),
            duration: end - start
        });
    });
});

server.listen(PORT, () => { console.log(`Server is running at http://localhost:${PORT}`); });