// generates an array of consecutive numbers
const rangeFun = ( start, end, step = 1 ) => {
    const rangeArray = [];
    if ( step < 0 ) step = -step;
    if ( step === 0 ) step = 1;
    if ( start > end ) {
        for ( let i = start; i >= end; i -= step ) rangeArray.push(i);
    } else {
        for ( let i = start; i <= end; i += step ) rangeArray.push(i);
    }
    return rangeArray;
};

// ads all the numbers from an array
const rangeSum = ( array ) => {
    let result = 0;
    for ( let num of array ) {
        result += num;
    }
    return result;
};

// reverse an array by creating a new one
const reverseArray = ( array ) => {
    let reversedArray = [];
    for ( let item of array ) reversedArray.unshift(item);
    return reversedArray;
};

const reverseArrayInPlace = ( array ) => {
    // i is less than floor(array.length / 2) to iterate through the first halve of the items
    for ( let i = 0; i < Math.floor(array.length / 2); i++) {
        // currentVal is used to swap array items
        let currentVal = array[i];
        // swap the items in the array
        array[i] = array[array.length - 1 - i];
        array[array.length - 1 - i] = currentVal;
        // array[array.length - 1 - i] is the item with the same index if counting from the end
    }
    return array;
};

// used to test upper functions
const randArr = rangeFun(4, 28, 5);

// helper function
function prependList( item, list ) {
    list = {value: item, rest: list};
    return list;
}

// iterative solution
function arrayToListI( array ) {
    let list, oldList;
    oldList = null;
    for ( let i  = array.length - 1; i >= 0; i-- ) {
        list = {value: array[i], rest: oldList};
        oldList = list;
    }
    return list;
}

// recursive solution
function arrayToListR( array ) {
    function createList(arr, n) {
        let list;
        // when n is equal to the latest index in the array
        if ( n === arr.length - 1 ) {
            list = {value: arr[n], rest: null};
        } else {
            list = {value: arr[n], rest: createList(arr, n + 1)};
        }
        return list;
    }
    return createList(array, 0);
}

// iterative solution
function listToArrayI( list ) {
    let array = [];
    for ( let i = 0; ; i++) {
        array.push(list.value);
        if ( list.rest === null ) break;
        else list = list.rest;
    }
    return array;
}

// recursive solution
function listToArrayR( List ) {
    let array = [];
    function createArray(list) {
        array.push(list.value);
        if ( list.rest === null ) return;
        else list = list.rest;
        createArray(list)
    }
    createArray(List);
    return array;
}

function nthInList( n, list ) {
    for ( let i = 0; ; i++) {
        if (i === n) {
            return list.value;
        } else if (list.rest === null) {
            return undefined;
        } else {
            list  = list.rest;
        }
    }
}

// used to test listTOArray() function
let List = arrayToListR([1, 2, 3, 4, 5]);
