//
// ────────────────────────────────────────────────────────────────── I ──────────
//   :::::: P L A T F O R M   G A M E : :  :   :    :     :        :          :
// ────────────────────────────────────────────────────────────────────────────
//

/* global simpleLevel:true */

/**
 *  Rules:
 *  1. The player should avoid lava(red stuff) and monsters
 *  2. Once it touches one of these, the level resets
 *  3. To complete a level, all coins should be collected
 */

//
// ─── ACTORS ─────────────────────────────────────────────────────────────────────
//

class Vec {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    plus(other) {
        return new Vec(this.x + other.x, this.y + other.y);
    }

    times(factor) {
        return new Vec(this.x * factor, this.y * factor);
    }
}

class Player {
    constructor(pos, speed) {
        this.pos = pos;
        this.speed = speed;
    }

    static create(pos) {
        return new Player(pos.plus(new Vec(0, -0.5)), new Vec(0, 0));
    }
}
Player.prototype.type = 'player';
Player.prototype.size = new Vec(0.8, 1.5);

class Lava {
    constructor(pos, speed, reset) {
        this.pos = pos;
        this.speed = speed;
        this.reset = reset;
    }

    static create(pos, char) {
        if (char === '=') {
            // the 'speed' is a horizontal vector
            return new Lava(pos, new Vec(2, 0));
        }
        if (char === '|') {
            // the 'speed' is a vertical vector
            return new Lava(pos, new Vec(0, 2));
        }
        if (char === 'v') {
            return new Lava(pos, new Vec(0, 3), pos);
        }
        throw new Error('Unknown Lava type');
    }
}
Lava.prototype.type = 'lava';
Lava.prototype.size = new Vec(1, 1);

class Coin {
    constructor(pos, basePos, wobble) {
        this.pos = pos;
        this.basePos = basePos;
        this.wobble = wobble;
    }

    static create(pos) {
        const basePos = pos.plus(new Vec(0.2, 0.1));
        return new Coin(basePos, basePos, Math.random() * Math.PI * 2);
    }
}
Coin.prototype.type = 'coin';
Coin.prototype.size = new Vec(0.6, 0.6);

const levelChars = {
    '.': 'empty',
    '#': 'wall',
    '+': 'lava',
    '@': Player,
    '=': Lava,
    '|': Lava,
    v: Lava,
    o: Coin,
};

//
// ─────────────────────────────────────────────────────────────────── ACTORS ─────
//
//
// ─── READING A LEVEL ────────────────────────────────────────────────────────────
//

class Level {
    constructor(plan) {
        // separate the plan string into a collection of arrays containing
        // the information for each line
        const rows = plan.trim().split('\n').map(line => [...line]);
        this.height = rows.length;
        this.width = rows[0].length;
        this.startActors = [];

        // 'y' and 'x' are indexes of the map method
        this.rows = rows.map((row, y) => (
            // 'char' is the type of block on a specific (x, y) position
            row.map((char, x) => {
                const type = levelChars[char];
                if (typeof type === 'string') return type;
                this.startActors.push(type.create(new Vec(x, y), char));
                return 'empty';
            })
        ));
    }
}

// persistent state class
class State {
    constructor(level, actors, status) {
        this.level = level;
        this.actors = actors;
        this.status = status;
    }

    get player() {
        return this.actors.find(a => a.type === 'player');
    }

    static start(level) {
        return new State(level, level.startActors, 'playing');
    }
}

//
// ────────────────────────────────────────────────────────── READING A LEVEL ─────
//

const lvl1 = new Level(simpleLevel);
console.log(lvl1);
