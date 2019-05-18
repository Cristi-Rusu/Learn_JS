// this higher order function takes an array and a function to introduce in the for loop and if statement
function filterArray( array, test ) {
    let passed = [];
    for ( let elem of array ) {
        if ( test(elem) ) {
            passed.push(elem);
        }
    }
    return passed;
}

// console.log('Living Scripts:', filterArray(Scripts, script =>  script.living ));
// console.log('Right to Left Scripts:', filterArray(Scripts, script => script.direction === 'rtl' ));

// filter is a standard array method
// the statements above could be written as:
// console.log('Living Scripts:', Scripts.filter(script =>  script.living ));
// console.log('Right to Left Scripts:', Scripts.filter(script => script.direction === 'rtl' ));

// this function is similar to the filterArray function instead it returns
function mapArray( array, transform ) {
    let mapped = [];
    for ( let elem of array ) {
        mapped.push( transform(elem) );
    }
    return mapped;
}

const rtlScripts = Scripts.filter(script => script.direction === 'rtl' );
// console.log('Right to Left Scripts Names:', mapArray(rtlScripts, script => script.name ));

// like filter, map is a standard array method:
// console.log('Right to Left Scripts Names:', rtlScripts.map(script => script.name ));

function reduceArray( array, combine, start ) {
    let current = start;
    for ( let elem of array ) {
        current = combine( current, elem );
    }
    return current;
}
// 'a' stands for the 'current' variable in the function
// 'b' stand for the 'elem' variable in the function
// this function call combines all elements by adding them, starting from 0( zero )
// console.log(reduceArray([1,2,3,4,5,6], (a, b) => a + b, 0));

// reduce is a standard array method and is doesn't need a start value if the array contains at least one element
// it starts from the first if no value is given for 'start'
// console.log([1,2,3,4,5,6].reduce( (a, b) => a + b ));

// calculate the character number function
function characterCount( script ) {
    // gets the scrip.ranges array
    // and adds range difference to the 'count'
    return script.ranges.reduce(( count, [from, to] ) => {
        return count + ( to - from );
    }, 0)
}

// returns the script with the biggest number of characters
// console.log(Scripts.reduce((a, b) => {
//     return characterCount(a) > characterCount(b) ? a : b;
// }));

// log the script with the biggest range without higher order functions
let biggestRange = null;
for ( let script of Scripts ) {
    if ( biggestRange === null || characterCount(biggestRange) < characterCount(script) ) {
        biggestRange = script;
    }
}
// console.log( biggestRange );

// get the 'Han' script from the array
const hanScript = Scripts.filter(script => script.name === 'Han')[0];

// console.log(characterCount( hanScript ));

function averageNum( array ) {
    return array.reduce((a, b) => a + b) / array.length;
}

// output the average year of the living Scripts
// console.log(Math.round(averageNum(
//     Scripts.filter(script => script.living ).map(script => script.year))));

// output the average year of the not living Scripts
// console.log(Math.round(averageNum(
//     Scripts.filter(script => !script.living ).map(script => script.year))));


// the 'Array.prototype.some' method test whether at least one element in the array passes implemented by the provided function
// it returns a Boolean value
// this returns false on any condition put on an empty array


// returns the script that contains the character code provided
function charScript( code ) {
    for ( let script of Scripts ) {
        // some is a higher function method for arrays
        // this piece of code returns whether the code is contained in the current array of ranges
        if ( script.ranges.some( ([from, to]) => {
            return code >= from && code < to;
        })) {
            return script;
        }
    }
    return null;
}

// same as 'charScript' but uses the Rest syntax and the 'map' higher order function
// to return an array of scripts containing the character codes provided
function charScriptRest( ...scriptCodes ) {
    return scriptCodes.map(( code ) => {
        for ( let script of Scripts ) {
            // some is a higher function method for arrays
            // this piece of code returns whether the code is contained in the current array of ranges
            if ( script.ranges.some( ([from, to]) => {
                return code >= from && code < to;
            })) {
                return script;
            }
        }
        return null;
    })
}

// 'findIndex' method takes a test function and returns the index of the first element which satisfies the it
// if there is no such element it return '-1'

// this function counts the elements in an array according to the categories given in the groupName function
function countBy( items, groupName ) {
    let counts = [];
    for ( let item of items ) {
        // the name is received from the assigned function
        let name = groupName(item);
        // findIndex returns the index of the first item in 'counts' whose 'name' prop is equal to the current name
        // if there is no such item it returns -1
        let known = counts.findIndex(c => c.name === name );
        if ( known === -1 ) {
            counts.push({name, count: 1});
        } else {
            counts[known].count++;
        }
    }
    return counts;
}

function textScripts( text ) {
    // 'scripts' stores the names and num of characters in the 'text'
    // call 'countBy' higher function to count based on scripts
    let scripts = countBy(text, char => {
        // determine the script containing the char using 'charScript'
        // get the char code with 'codePointAt(0)'
        let script = charScript(char.codePointAt(0));
        return script ? script.name : 'none';
    // filter out the object with the 'name' === 'none'
    }).filter( ({name}) => name !== 'none');

    let total = scripts.reduce((n, {count}) => n + count, 0);
    if ( total === 0 ) return 'No scripts are found';
    // return an array of names and percentages using 'map' to transform each item in the array
    return scripts.map(({name, count}) => {
        let percentage = Math.round((count * 100) / total);
        return `${name} ${percentage}%`;
    // use the 'join' method to create a string separated by ', ' , from the array
    }).join(', ');
}

function flattenArray( array ) {
    let flattened = array;
    // while at least one item in the array is an array
    while ( flattened.some((item) => Array.isArray(item) ) ) {
        // use 'reduce' to create a new array by concatenating 'flat' with each item in the 'flattened' array
        flattened = flattened.reduce((flat, current) => flat.concat(current), []);
    }
    return flattened;
}

