// this is a prototype for rabbit objects
let protoRabbit = {
    speak( line ) {
        console.log(`The ${this.type} rabbit says: '${line}'`);
    }
};

// by convention the constructor functions are capitalized

// create an instance of a rabbit
function SimpleRabbit( type ) {
    this.type = type;
}

// new properties can be added using the 'prototype' property of the constructor
// using this syntax the properties given will be in the '__proto__' property
// regular functions should be used to get the expected behavior of the 'this' keyword
SimpleRabbit.prototype.speak = function( line ) {
    console.log(`The ${this.type} rabbit says: '${line}'`);
};

SimpleRabbit.prototype.eat = function( food ) {
    console.log(`The ${this.type} rabbit eats '${food}'`);
};

let whiteRabbit = new SimpleRabbit('White');
// console.log(whiteRabbit);

// 'class' notation in JavaScript
// the function named 'constructor' inside a class is treated as the constructor function
// the rest of the functions are added to it's prototype
class Rabbit {
    constructor( type ) {
        this.type = type;
    }
    speak( line ) {
        console.log(`The ${this.type} rabbit says: '${line}'`);
    }
    eat( food ) {
        console.log(`The ${this.type} rabbit eats '${food}'`);
    }
}

let blackRabbit = new Rabbit('Black');
let happyRabbit = new Rabbit('Happy');
let killerRabbit = new Rabbit('Killer');
// console.log(happyRabbit);

// prototype properties are overwritten by the objects properties
Rabbit.prototype.teeth = 'small';

// console.log('killerRabbit teeth:', killerRabbit.teeth);
// -> 'small'

killerRabbit.teeth = 'long and sharp';
// console.log('killerRabbit teeth updated:', killerRabbit.teeth);
// -> 'long and sharp'
// console.log('blackRabbit teeth:', blackRabbit.teeth);
// -> 'small'

// Maps in js are use to store keys and their values
let ages = new Map();
// to add a key and a value use the method 'set'
ages.set('Boris', 39);
ages.set('Jack', 67);
ages.set('Julia', 23);

// use 'get' to use a value of a key
// console.log(`Boris' age is ${ages.get('Boris')}`);
// to find if a key exists in a map, use the method 'has'
// console.log(`Is Vlad's age known? ${ages.has('Vlad')}`);

// 'hasOwnProperty' can be used on an object to find if it contains a specific key itself, not in the prototype
// console.log({x: 1}.hasOwnProperty('x'));
// console.log({x: 1}.hasOwnProperty('toString'));

// methods of an object can be overwritten to be able to call them with functions like 'String'
// which look for the 'toString' property in the prototype and use it to return a more meaningful result than [object Object]
// this concept is called Polymorphism
Rabbit.prototype.toString = function() {
    return `a ${this.type} rabbit`;
};

// console.log(String(killerRabbit));

// Symbols are suitable for defining interfaces
// they are created with the function 'Symbol' and are unique
let sym = Symbol('sym');
// console.log(sym === Symbol('sym'));

// thank's to symbols, properties with the same name can be inside an interface
const toStringSym = Symbol('toStringSym');
Array.prototype[toStringSym] = function() {
    return `An array with ${this.length} items`;
};
// to access the symbol, use the square brackets notation
// console.log([1,2,3].toString());
// -> 1,2,3
// console.log([1,2,3][toStringSym]());
// -> An array with 3 items

// it is possible to include symbol properties in objects by simply using the square brackets
let stringObject = {
    [toStringSym]() {
        return `a jute rope`;
    }
};
// console.log(stringObject[toStringSym]());


class Matrix {
    constructor( width, height, element = (x, y) => undefined ) {
        this.width = width;
        this.height = height;
        this.content = [];

        // create the matrix
        for ( let y = 0; y < height; y++ ) {
            for ( let x = 0; x < width; x++ ) {
                // this matrix is a flat array, so to traverse the matrix
                // we use the formula "y * width + x"
                this.content[y * width + x] = element(x, y);
            }
        }
    }
    // retrieve an element
    get( x, y ) {
        return this.content[y * this.width + x];
    }
    // update an element in the matrix
    set( x, y, value ) {
        this.content[y * this.width + x] = value;
    }
    // make the 'Matrix' iterable directly in the class
    [Symbol.iterator]() {
        return new MatrixIterator(this);
    }
}

class MatrixIterator {
    constructor( matrix ) {
        this.x = 0;
        this.y = 0;
        this.matrix = matrix;
    }

    next() {
        // if 'y' is equal to the matrix height, the loop is done
        if ( this.y === this.matrix.height ) return {done: true};

        let value = {
            x: this.x,
            y: this.y,
            value: this.matrix.get(this.x, this.y)
        };
        
        this.x++;
        // if 'x' is equal to the matrix width, move to the next row
        if ( this.x === this.matrix.width ) {
            this.x = 0;
            this.y++;
        }

        return {value, done: false};
    }
}
// make the 'Matrix' prototype iterable by changing the prototype
// Matrix.prototype[Symbol.iterator] = function() {
//     return new MatrixIterator(this);
// };

let matrix = new Matrix(3, 2, (x, y) => `(${x}, ${y})` );
// the 'Matrix' prototype is iterable
for (let {x, y, value} of matrix) {
    matrix.set(x, y, `${x * 3}, ${y * 3}`);
}
console.log(matrix);

let matrix2 = new Matrix(3, 3, (x, y) => `(${x}, ${y})` );
console.log(matrix2);

// getters are properties that hide a method call with the key word 'get'
let varyingSize = {
    get size() {
        return Math.floor(Math.random() * 100);
    }
};
// the 'size' property calls first the method and then display's it's value
// console.log(varyingSize.size);
// console.log(varyingSize.size);

// the 'Temperature' class stores the information in celsius degrees
// fahrenheit degrees can be set and got using setters and getters
// thanks to a static method, 'Temperature' instances can be created by passing fahrenheit values
class Temperature{
    constructor( celsius ) {
        this.celsius = celsius;
    }
    get fahrenheit() {
        return (this.celsius * 1.8 + 32).toFixed(1);
    }
    // setters are used to assign a property some value
    set fahrenheit( value ) {
        this.celsius = ((value - 32) / 1.8).toFixed(1);
    }
    // statics are stored on the constructor
    // they are used to create instances of a class from different values
    static fromFahrenheit( value ) {
        return new Temperature( ((value - 32 ) / 1.8).toFixed(1) );
    }
}

let temp = new Temperature(25);
console.log('temp:', temp);
// get fahrenheit value
console.log('temp fahrenheit:', temp.fahrenheit);
// set a fahrenheit value
temp.fahrenheit = 100;
// this method has changed the instance of 'Temperature'
console.log('temp:', temp);


// 'SymmetricMatrix' is a subclass
// 'Matrix' is it's superclass
// the 'super' keyword is used to access the superclass' properties
// 'super' function is the constructor function of the superclass
class SymmetricMatrix extends Matrix {
    constructor(size, element = (x, y) => undefined ) {
        super(size, size, (x, y) => {
            if ( x < y) return element(y, x);
            else return element(x, y);
        });
    }
    set(x, y, value) {
        super.set(x, y, value);
        if ( x !== y ) {
            super.set(y, x, value);
        }
    }
}

let symMatrix = new SymmetricMatrix(3, (x, y) => `(${x}, ${y})`);
console.log(symMatrix);
console.log('symMatrix(1, 2):', symMatrix.get(1, 2));
