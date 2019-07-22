const { request } = require('http');

// the data sent by the request is 'Hello server!'
request({
    hostname: 'localhost',
    port: 8000,
    method: 'POST',
}, (response) => {
    process.stdout.write('Response:\n');
    response.on('data', chunk => (
        // 'chunk' is an Array Buffer, so convert it to string
        // process.stdout is a writable stream,
        // which is convenient because the response can come in chunks
        // console.log wouldn't fit this purpose, because it would treat each chunk separately(new line)
        process.stdout.write(chunk.toString())
    ));
    // add new line at the end of the writable stream
    response.on('end', () => process.stdout.write('\n'));
}).end('Hello server!');
