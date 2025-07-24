const http = require('http');
const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello AWS via PM2!\n');
});

server.listen(8080, '0.0.0.0', () => {
  console.log('PM2 server running on port 8080');
  console.log('Process ID:', process.pid);
});
