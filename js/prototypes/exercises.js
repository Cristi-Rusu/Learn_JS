/* Prototypes */

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    get length() {
        return Math.sqrt((this.x ** 2) + (this.y ** 2));
    }

    // the angle between the vector and the main axis
    get angle() {
        return Math.atan2(this.y, this.x);
    }

    get angleDeg() {
    // multiply with 180/PI to transform the radians to degrees
        const deg = this.angle * 180 / Math.PI;
        // add 360 to the negative values to display the angle in positive degree values
        if (deg < 0) return deg + 360;
        return deg;
    }

    // change the vector's length, preserving it's direction
    set length(len) {
        const newX = len * Math.cos(this.angle);
        const newY = len * Math.sin(this.angle);
        this.x = newX;
        this.y = newY;
    }

    // change the vector's angle, preserving it's length
    set angle(alpha) {
        const newX = this.length * Math.cos(alpha);
        const newY = this.length * Math.sin(alpha);
        this.x = newX;
        this.y = newY;
    }

    // create an instance of 'Vector' form 'length' and 'alpha'(it's angle) values
    static fromLenAngle(len, alpha) {
        const valX = len * Math.cos(alpha);
        const valY = len * Math.sin(alpha);

        return new Vector(valX, valY);
    }

    // same as 'fromLenAngle' but alpha is given in degrees
    static fromLenAngleDeg(len, alpha) {
        const radAlpha = alpha * Math.PI / 180;
        const valX = len * Math.cos(radAlpha);
        const valY = len * Math.sin(radAlpha);

        return new Vector(valX, valY);
    }

    // add two vectors( this and another )
    plus(vector) {
        const newX = this.x + vector.x;
        const newY = this.y + vector.y;
        return new Vector(newX, newY);
    }

    // subtract two vectors( this and another )
    minus(vector) {
        const newX = this.x - vector.x;
        const newY = this.y - vector.y;
        return new Vector(newX, newY);
    }
}

const vec1 = new Vector(3, 4);
const vec2 = new Vector(-1, 2);
const vec3 = new Vector(-2, -7);
const vec4 = new Vector(5, -9);

console.group('Vectors');
console.log(vec1);
console.log(vec2);
console.log(vec3);
console.log(vec4);
console.groupEnd();

class GroupIterator {
    constructor(group) {
        this.counter = 0;
        this.group = group;
    }

    next() {
        if (this.counter === this.group.content.length) {
            return { done: true };
        }

        const value = {
            i: this.counter,
            val: this.group.content[this.counter],
        };

        this.counter += 1;

        return { value, done: false };
    }
}

class Group {
    constructor() {
        this.content = [];
    }

    add(item) {
    // if the item is not inside the 'Group'
        if (!this.content.includes(item)) {
            this.content.push(item);
        }
        return this;
    }

    delete(item) {
        if (this.content.includes(item)) {
            this.content = this.content.filter(elem => elem !== item);
            return true;
        }
        return false;
    }

    has(item) {
        return this.content.includes(item);
    }

    static from(array) {
        const formedGroup = new Group();
        for (const elem of array) {
            formedGroup.add(elem);
        }
        return formedGroup;
    }

    [Symbol.iterator]() {
        return new GroupIterator(this);
    }
}

const group1 = new Group();
group1.add(23);
group1.add(45);
group1.add(2);
group1.add(7);
console.log('group1:', group1);

const group2 = Group.from([1, 2, 2, 3, 4, 4, 4, 5]);
console.log('group2:', group2);

for (const { i, val } of group2) {
    group2.content[i] = val * 3;
}

// persistent(immutable) group
// eslint-disable-next-line no-unused-vars
class PGroup {
    constructor() {
        this.content = [];
    }

    add(item) {
        if (!this.content.includes(item)) {
            return new PGroup(this.content.concat(item));
        }
        return this;
    }

    delete(item) {
        return new PGroup(this.content.filter(c => c !== item));
    }

    has(item) {
        return this.content.includes(item);
    }

    static from(array) {
        const formedGroup = new Group();
        for (const elem of array) {
            formedGroup.add(elem);
        }
        return formedGroup;
    }
}
