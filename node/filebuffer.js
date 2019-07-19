const { readFile } = require('fs');

const file = process.argv[2];

readFile(file, (err, buffer) => {
    if (err) throw err;
    console.log(`
        The file contains ${buffer.length} bytes.
        The first byte is ${buffer[0]}.
    `);
});
