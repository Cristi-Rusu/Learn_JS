const { reverse } = require('./reverse.js');
// get the string from the command's argument
const string = process.argv[2];

console.log(reverse(string));
