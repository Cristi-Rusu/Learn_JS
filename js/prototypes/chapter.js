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
console.log(whiteRabbit);

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

let happyRabbit = new Rabbit('Happy');
console.log(happyRabbit);
