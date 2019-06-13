//
// ────────────────────────────────────────────────────────────────── I ──────────
//   :::::: P L A T F O R M   G A M E : :  :   :    :     :        :          :
// ────────────────────────────────────────────────────────────────────────────
//

/* global simpleLevelPlan:true */

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
//
// ─── DRAWING ────────────────────────────────────────────────────────────────────
//

// the number of pixels a single unit takes up on the screen
const SCALE = 20;

/**
 * Creates a DOM element and returns it
 * @param {String} name tag name
 * @param {Object} attrs An object containing the attribute names as keys and the attribute values as properties
 * @param  {...Node} children child nodes of the created element
 */
function elt(name, attrs, ...children) {
    const dom = document.createElement(name);
    for (const attr of Object.keys(attrs)) {
        dom.setAttribute(attr, attrs[attr]);
    }
    for (const child of children) {
        dom.appendChild(child);
    }
    return dom;
}

// creates a table which draws the static blocks from the given level
function drawGrid(level) {
    return elt('table', {
        class: 'background',
        width: `${level.width * SCALE}px`,
        // pass as the third argument of 'elt' all the 'tr' elements created using the spread operator(...)
    }, ...level.rows.map(row => (
        elt('tr', { style: `height: ${SCALE}px` },
            // each row contains the 'type' information of the grid block('td' in this case)
            ...row.map(type => elt('td', { class: type })))
    )));
}

function drawActors(actors) {
    return elt('div', {}, ...actors.map((actor) => {
        // our actors will be rectangles
        const rect = elt('div', { class: `actor ${actor.type}` });
        rect.style.width = `${actor.size.x * SCALE}px`;
        rect.style.height = `${actor.size.y * SCALE}px`;
        rect.style.left = `${actor.pos.x * SCALE}px`;
        rect.style.top = `${actor.pos.y * SCALE}px`;
        return rect;
    }));
}

// a display is created by giving it a parent node and a level to draw
class DOMDisplay {
    constructor(parent, level) {
        this.dom = elt('div', { class: 'game' }, drawGrid(level));
        this.actorLayer = null;
        parent.appendChild(this.dom);
    }

    scrollPlayerIntoView(state) {
        const width = this.dom.clientWidth;
        const height = this.dom.clientHeight;
        const marginX = width / 3;
        const marginY = height / 3;
        // The viewport
        // the distance scrolled from the top-left corner
        const left = this.dom.scrollLeft;
        const top = this.dom.scrollTop;
        const right = width + left;
        const bottom = width + top;

        const { player } = state;
        // get the center point of the player body
        const center = player.pos.plus(player.size.times(0.5)).times(SCALE);

        // scroll the viewport if the player is near the edges(les than 1/3 of viewport)
        if (center.x < left + marginX) {
            this.dom.scrollLeft = center.x - marginX;
        } else if (center.x > right - marginX) {
            // subtract the 'width' because we set the Left scroll position
            this.dom.scrollLeft = center.x + marginX - width;
        }
        if (center.y < top + marginY) {
            this.dom.scrollTop = center.y - marginY;
        } else if (center.y > bottom - marginY) {
            // subtract the 'height' because we set the Top scroll position
            this.dom.scrollTop = center.y + marginY - height;
        }
    }

    syncState(state) {
        // create a new actorLayer
        if (this.actorLayer) this.actorLayer.remove();
        this.actorLayer = drawActors(state.actors);
        this.dom.appendChild(this.actorLayer);
        // update the background color depending on the status
        this.dom.className = `game ${state.status}`;
        this.scrollPlayerIntoView(state);
    }

    clear() { this.dom.remove(); }
}

//
// ────────────────────────────────────────────────────────────────── DRAWING ─────
//

const simpleLevel = new Level(simpleLevelPlan);
console.log(simpleLevel);

const display = new DOMDisplay(document.body, simpleLevel);
display.syncState(State.start(simpleLevel));
