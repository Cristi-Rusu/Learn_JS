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
    // push the first element from the list
    array.push(list.value);
    // 'get inside' the rest value of the list until it's equal to null
    while ( list.rest !== null ) {
        list = list.rest;
        array.push(list.value);
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
const List = arrayToListR([1, 2, 3, 4, 5]);

const objLength = obj => Object.keys(obj).length;
const objKeys = obj => Object.keys(obj);

function equalPropNum( obj1, obj2 ) {
    const obj1Length = objLength(obj1);
    const obj2Length = objLength(obj2);

    if ( obj1Length === obj2Length ) {

        for ( let i = 0; i < obj1Length; i++ ) {
            const obj1Key = objKeys(obj1)[i];
            const obj2Key = objKeys(obj2)[i];

            const obj1Prop = obj1[obj1Key];
            const obj2Prop = obj2[obj2Key];

            // if obj1Prop is an object and obj2Prop is not
            if ( typeof obj1Prop === 'object' && typeof obj2Prop !== 'object' ) {
                return false;
            // if obj1Prop is not an object but obj2Prop is
            } else if ( typeof obj1Prop !== 'object' && typeof obj2Prop === 'object' ) {
                return false;
            // if both obj1Prop and obj2Prop are objects
            } else if ( typeof obj1Prop === 'object' && typeof obj2Prop === 'object' ) {

                if ( obj1Prop === null && obj2Prop !== null ) {
                    return false;
                } else if ( obj1Prop !== null && obj2Prop === null ) {
                    return false;
                } else if ( obj1Prop !== null && obj2Prop !== null ) {
                    if ( equalPropNum( obj1Prop, obj2Prop ) === false ) {
                        return false;
                    }
                }
            }
        }
    } else {
        return false;
    }
    return true;
}

// if compares all the keys and values of an object to tell if they have identical properties
function deepEqual( obj1, obj2 ) {
    const obj1Length = objLength(obj1);
    const obj2Length = objLength(obj2);

    if ( obj1Length === obj2Length ) {
        for ( let i = 0; i < obj1Length; i++ ) {

            const obj1Key = objKeys(obj1)[i];
            const obj2Key = objKeys(obj2)[i];

            const obj1Prop = obj1[obj1Key];
            const obj2Prop = obj2[obj2Key];

            if ( obj1Key === obj2Key ) {
                // if both obj1Prop and obj2Prop are objects
                if ( typeof obj1Prop === 'object' && typeof obj2Prop === 'object' ) {
                    // null is also an object is js
                    // so in order to act on 'objects' explicitly we should compare them against null
                    if ( obj1Prop === null && obj2Prop !== null ) {
                        return false;
                    } else if ( obj1Prop !== null && obj2Prop === null ) {
                        return false;
                    } else if ( obj1Prop !== null && obj2Prop !== null ) {
                        // call the function recursively on the property objects
                        if ( deepEqual(  obj1Prop, obj2Prop ) === false ) {
                            return false;
                        }
                    }

                } else if ( obj1Prop !== obj2Prop ) {
                    return false;
                }
            } else {
                return false;
            }
        }
    } else {
        return false;
    }
    return true;
}

const Obj1 = {val1: 23, val2: {is: 'object', and: 'object'}, val3: {say: 'moo', and: {moo: 'again', and: 'again'}}},
      Obj2 = {val1: 23, val2: {is: 'object', and: 'object'}, val3: {say: 'moo', and: {moo: 'again', and: 'again'}}},
      Obj3 = {val1: 2, val2: 'haha', val3: 'moo'},
      Obj4 = {val1: 2, val2: 'haha', val3: 'moo'};
