http = require('http');
const port = 4000;
const server = http.createServer((req,res)=>{
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    
    METHOD=req.method;
    URL=req.url;
    DATE = new Date().toISOString();

    if(URL==='/'){
        res.end('Home page');
    }
    else if(URL==='/about'){
        res.end('About page');
    }
    else res.end('Page not found');
    
    console.log(`You made a ${METHOD} request to ${URL}. Timestamp: ${DATE}`);
});

server.listen(port, () => { console.log(`Server is running on port ${port}`); });