/* Higher Order Functions */

// Functions that operate on other functions, either by taking them as arguments
// or by returning them are called higher order functions
let labels = [];
// a function should be passed for the 'action' parameter
function toRepeat( n, action ) {
    for ( let i = 0; i < n; i++ ) {
        action(i);
    }
}

toRepeat(10, i => {
    labels.push(`Unit ${i + 1}`);
});
// console.log(labels);

// functions that create new functions
function greaterThan( n ) {
    return m => m > n;
}
// this function stores another and returns the result based the value it contains
const greaterThan10 = greaterThan(10);
// console.log(greaterThan10( 18 ));

// this function takes a function as an argument and needs another separate parentheses for '...args' spread operator
function noisy( fun ) {
    return (...args) => {
        console.log('Called width', args);
        let result = fun(...args);
        console.log('Called width', args, ' returned', result);
        return result;
    }
}
// console.log(noisy( Math.min )( 3, 2, 6 ));

// a function that provides control flow
function unless( test, then ) {
    if ( !test ) then();
}

console.group('Even numbers:');
toRepeat(5, n => {
    unless( n % 2 === 1, () => {
        console.log(`${n} is even`);
    })
});
console.groupEnd();

// array forEach higher order function
console.group('Letters:');
['A', 'B', 'C'].forEach( letter => console.log(letter) );
console.groupEnd();