const { writeFile } = require('fs');

writeFile('graffiti.txt', 'Node Was Here', (err) => {
    if (err) console.error('Failed to write file:', err);
    console.log('File written');
});
