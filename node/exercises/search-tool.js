const { readFile } = require('fs');
const { statSync, readdirSync } = require('fs');
const { sep } = require('path');

const regex = new RegExp(process.argv[2]);
const paths = process.argv.slice(3);

console.log('Matched files:');
function findInFiles(reg, files) {
    for (const file of files) {
        const stats = statSync(file);
        if (stats.isDirectory()) {
            const dirFiles = readdirSync(file)
                .map(dirFile => (file + sep + dirFile));
            findInFiles(reg, dirFiles);
        } else {
            readFile(file, 'utf8', (err, text) => {
                if (err) throw err;
                if (text.match(reg)) {
                    console.log(file);
                }
            });
        }
    }
}
findInFiles(regex, paths);
