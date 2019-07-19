const { readFile } = require('fs');
// the first argument of the command
const file = process.argv[2];

readFile(file, 'utf8', (err, text) => {
    if (err) throw err;
    console.log('The file\'s content is:\n', text);
});
