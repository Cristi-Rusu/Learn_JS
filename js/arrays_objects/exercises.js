/* Arrays and Objects */

/* eslint-disable no-unused-vars */

// generates an array of consecutive numbers
const rangeFun = (start, end, step = 1) => {
  const rangeArray = [];
  if (step < 0) step = -step;
  if (step === 0) step = 1;
  if (start > end) {
    for (let i = start; i >= end; i -= step) rangeArray.push(i);
  } else {
    for (let i = start; i <= end; i += step) rangeArray.push(i);
  }
  return rangeArray;
};

// ads all the numbers from an array
const rangeSum = (array) => {
  let result = 0;
  for (const num of array) {
    result += num;
  }
  return result;
};

// reverse an array by creating a new one
const reverseArray = (array) => {
  const reversedArray = [];
  for (const item of array) reversedArray.unshift(item);
  return reversedArray;
};

const reverseArrayInPlace = (array) => {
  // i is less than floor(array.length / 2) to iterate through the first halve of the items
  for (let i = 0; i < Math.floor(array.length / 2); i++) {
    // currentVal is used to swap array items
    const currentVal = array[i];
    // mirrorIndex is the item with the same index if counting from the end
    const mirrorIndex = array.length - 1 - i;
    // swap the items in the array
    array[i] = array[mirrorIndex];
    array[mirrorIndex] = currentVal;
  }
  return array;
};

// used to test upper functions
const randArr = rangeFun(4, 28, 5);

// helper function
function prependList(item, list) {
  list = { value: item, rest: list };
  return list;
}

// iterative solution
function arrayToListI(array) {
  let list = null;
  for (let i = array.length - 1; i >= 0; i--) {
    list = { value: array[i], rest: list };
  }
  return list;
}

// recursive solution
function arrayToListR(array) {
  function createList(arr, n) {
    let list;
    // when n is equal to the latest index in the array
    if (n === arr.length - 1) {
      list = { value: arr[n], rest: null };
    } else {
      list = { value: arr[n], rest: createList(arr, n + 1) };
    }
    return list;
  }
  return createList(array, 0);
}

// iterative solution
function listToArrayI(list) {
  const array = [];
  // push the first element from the list
  array.push(list.value);
  // 'get inside' the rest value of the list until it's equal to null
  while (list.rest !== null) {
    list = list.rest;
    array.push(list.value);
  }
  return array;
}

// recursive solution
function listToArrayR(List) {
  const array = [];
  function createArray(list) {
    array.push(list.value);
    if (list.rest === null) return;
    list = list.rest;
    createArray(list);
  }
  createArray(List);
  return array;
}

function nthInList(n, list) {
  for (let i = 0; ; i++) {
    if (i === n) {
      return list.value;
    } if (list.rest === null) {
      return undefined;
    }
    list = list.rest;
  }
}

function nthInListR(list, n) {
  if (!list) return undefined;
  if (n === 0) return list.value;
  return nthInListR(list.rest, n - 1);
}

// used to test listTOArray() function
const List = arrayToListR([1, 2, 3, 4, 5]);

const objLength = obj => Object.keys(obj).length;
const objKeys = obj => Object.keys(obj);

// it tells if the objects have the same number of properties(nested as well)
function equalPropNum(obj1, obj2) {
  const obj1Length = objLength(obj1);
  const obj2Length = objLength(obj2);

  if (obj1Length === obj2Length) {
    for (let i = 0; i < obj1Length; i++) {
      const obj1Key = objKeys(obj1)[i];
      const obj2Key = objKeys(obj2)[i];

      const obj1Prop = obj1[obj1Key];
      const obj2Prop = obj2[obj2Key];

      // if obj1Prop is an object and obj2Prop is not
      if (typeof obj1Prop === 'object' && typeof obj2Prop !== 'object') {
        return false;
        // if obj1Prop is not an object but obj2Prop is
      } if (typeof obj1Prop !== 'object' && typeof obj2Prop === 'object') {
        return false;
        // if both obj1Prop and obj2Prop are objects
      } if (typeof obj1Prop === 'object' && typeof obj2Prop === 'object') {
        if (obj1Prop === null && obj2Prop !== null) {
          return false;
        } if (obj1Prop !== null && obj2Prop === null) {
          return false;
        } if (obj1Prop !== null && obj2Prop !== null) {
          if (equalPropNum(obj1Prop, obj2Prop) === false) {
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

// GOVNO CODE

// it compares all the keys and values of an object to tell if they have identical properties
function deepEqual(obj1, obj2) {
  const obj1Length = objLength(obj1);
  const obj2Length = objLength(obj2);

  if (obj1Length === obj2Length) {
    for (let i = 0; i < obj1Length; i++) {
      const obj1Key = objKeys(obj1)[i];
      const obj2Key = objKeys(obj2)[i];

      const obj1Prop = obj1[obj1Key];
      const obj2Prop = obj2[obj2Key];

      if (obj1Key === obj2Key) {
        // if both obj1Prop and obj2Prop are objects
        if (typeof obj1Prop === 'object' && typeof obj2Prop === 'object') {
          // null is also an object is js
          // so in order to act on 'objects' explicitly we should compare them against null
          if (obj1Prop === null && obj2Prop !== null) {
            return false;
          } if (obj1Prop !== null && obj2Prop === null) {
            return false;
          } if (obj1Prop !== null && obj2Prop !== null) {
            // call the function recursively on the property objects
            if (deepEqual(obj1Prop, obj2Prop) === false) {
              return false;
            }
          }
        } else if (obj1Prop !== obj2Prop) {
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

// deepEqual optimized
function deepEqualO(a, b) {
  if (a === b) return true;
  // if at least one of this conditions is true
  // it means that 'a' and 'b' have different values
  // if they where both null the function would return true on the first row
  if (a === null || typeof a !== 'object'
         || b === null || typeof b !== 'object') return false;
  // the only possible outcome at this point is that 'a' and 'b' are both regular objects
  const keysA = Object.keys(a); const
    keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    // if keysB doesn't include a key from 'a', or a property from 'a' is not equal to a property from 'b'
    if (!keysB.includes(key) || !deepEqual(a[key], b[key])) return false;
  }

  return true;
}

// used to test functions
const Obj1 = {
  val1: 23,
  val2: { is: 'object', and: 'object' },
  val3: { say: 'moo', and: { moo: 'again', and: 'again' } },
};
const Obj2 = {
  val1: 23,
  val2: { is: 'object', and: 'object' },
  val3: { say: 'moo', and: { moo: 'again', and: 'again' } },
};
const Obj3 = { val1: 2, val2: 'haha', val3: 'moo' };
const Obj4 = { val1: 2, val2: 'haha', val3: 'moo' };
