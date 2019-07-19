const { createServer } = require('http');

// the server can receive data as chunks and process then piece by piece
// when the stream ends, the response is being sent
createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    let received = '';
    // 'chunk' is an Array Buffer, so convert it to string first
    request.on('data', (chunk) => {
        received += chunk.toString();
        response.write(chunk.toString().toUpperCase());
    });
    request.on('end', () => {
        response.write(`\nRequest: ${received}`);
        response.end();
    });
}).listen(8000);
