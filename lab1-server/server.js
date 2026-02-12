http = require('http');
const port = 4000;
const server = http.createServer((req,res)=>{
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end('Hello Server!');
});

server.listen(port, () => { console.log(`Server is running on port ${port}`); });
