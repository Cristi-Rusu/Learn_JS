// RegExp Golf
const reg1 = /ca[rt]/;
const reg2 = /pr?op/;
const reg3 = /ferr(et|y|ari)/;
const reg4 = /ious\b/;
const reg5 = /\s[.,:;]/;
const reg6 = /\w{7}/;
const reg7 = /\b[^\We]+\b/i;

function verify(regexp, yes, no) {
    // Ignore unfinished exercises
    if (regexp.source === '...') return;
    for (const str of yes) {
        if (!regexp.test(str)) {
            console.log(`Failure to match '${str}'`);
        }
    }
    for (const str of no) {
        if (regexp.test(str)) {
            console.log(`Unexpected match for '${str}'`);
        }
    }
}

// tests
verify(reg1,
    ['my car', 'bad cats'],
    ['camper', 'high art']);

verify(reg2,
    ['pop culture', 'mad props'],
    ['plop', 'prrrop']);

verify(reg3,
    ['ferret', 'ferry', 'ferrari'],
    ['ferrum', 'transfer A']);

verify(reg4,
    ['how delicious', 'spacious room'],
    ['ruinous', 'consciousness']);

verify(reg5,
    ['bad punctuation .'],
    ['escape the period']);

verify(reg6,
    ['hottentottententen'],
    ['no', 'hotten totten tenten']);

verify(reg7,
    ['red platypus', 'wobbling nest'],
    ['earth bed', 'learning ape', 'BEET']);

const text = "'I'm the cook,' he said, 'it's my job.'";
// replace the single quotes with double quotes, except in words
console.log(text.replace(/(\W|^)'/g, '$1"'));

const number = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/;

// tests
for (const str of ['1', '-1', '+15', '1.55', '.5', '5.',
    '1.3e2', '1E-4', '1e+12']) {
    if (!number.test(str)) {
        console.log(`Failed to match '${str}'`);
    }
}
for (const str of ['1a', '+-1', '1.2.3', '1+1', '1e4.5',
    '.5.', '1f5', '.']) {
    if (number.test(str)) {
        console.log(`Incorrectly accepted '${str}'`);
    }
}
