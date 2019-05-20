class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    get length() {
        return Math.sqrt( this.x ** 2 + this.y ** 2 );
    }
    // the angle between the vector and the main axis
    get angle() {
        return Math.atan2(this.y, this.x);
    }
    get angleDeg() {
        // multiply with 180/PI to transform the radians to degrees
        let deg = this.angle * 180 / Math.PI;
        // add 360 to the negative values to display the angle in positive degree values
        if ( deg < 0 ) return deg + 360;
        else return deg;
    }

    // change the vector's length, preserving it's direction
    set length( len ) {
        let newX = len * Math.cos( this.angle );
        let newY = len * Math.sin( this.angle );
        this.x = newX;
        this.y = newY;
    }
    // change the vector's angle, preserving it's length
    set angle( alpha ) {
        let newX = this.length * Math.cos(alpha);
        let newY = this.length * Math.sin(alpha);
        this.x = newX;
        this.y = newY;
    }

    // create an instance of 'Vector' form 'length' and 'alpha'(it's angle) values
    static fromLenAngle( len, alpha ) {
        let valX = len * Math.cos(alpha);
        let valY = len * Math.sin(alpha);

        return new Vector(valX, valY);
    }
    // same as 'fromLenAngle' but alpha is given in degrees
    static fromLenAngleDeg( len, alpha ) {
        alpha = alpha * Math.PI / 180;
        let valX = len * Math.cos(alpha);
        let valY = len * Math.sin(alpha);

        return new Vector(valX, valY);
    }

    // add two vectors( this and another )
    plus( vector ) {
        let newX = this.x + vector.x;
        let newY = this.y + vector.y;
        return new Vector( newX, newY );
    }
    // subtract two vectors( this and another )
    minus( vector ) {
        let newX = this.x - vector.x;
        let newY = this.y - vector.y;
        return new Vector( newX, newY );
    }
}

let vec1 = new Vector(3, 4);
let vec2 = new Vector(-1, 2);
let vec3 = new Vector(-2, -7);
let vec4 = new Vector(5, -9);

console.group('Vectors');
console.log(vec1);
console.log(vec2);
console.log(vec3);
console.log(vec4);
console.groupEnd();


class Group {
    constructor() {
        this.content = [];
    }

    add( item ) {
        // if the item is not inside the 'Group'
        if ( !this.content.includes(item) ) {
            this.content.push(item);
        }
        return this;
    }
    delete( item ) {
        if ( this.content.includes(item) ) {
            this.content = this.content.filter(elem => elem !== item );
            return true;
        } else {
            return false;
        }
    }
    has( item ) {
        return this.content.includes(item);
    }

    static from( array ) {
        let formedGroup = new Group();
        for ( let elem of array ) {
            formedGroup.add(elem);
        }
        return formedGroup;
    }

    [Symbol.iterator]() {
        return new GroupIterator(this);
    }
}

class GroupIterator {
    constructor( group ) {
        this.counter = 0;
        this.group = group;
    }
    next() {
        if ( this.counter === this.group.content.length ) {
            return {done: true};
        }

        let value = {
            i: this.counter,
            val: this.group.content[ this.counter ]
        };

        this.counter++;

        return {value, done: false};
    }
}

let group1 = new Group();
group1.add(23);
group1.add(45);
group1.add(2);
group1.add(7);
console.log('group1:', group1);

let group2 = Group.from([1,2,2,3,4,4,4,5]);
console.log('group2:', group2);

for ( let {i, val} of group2 ) {
    group2.content[i] = val * 3;
}