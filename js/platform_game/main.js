//
// ────────────────────────────────────────────────────────────────── I ──────────
//   :::::: P L A T F O R M   G A M E : :  :   :    :     :        :          :
// ────────────────────────────────────────────────────────────────────────────
//

/* eslint-disable no-use-before-define */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-await-in-loop */
/* global simpleLevelPlan, GAME_LEVELS:true */

/*
 *  Rules:
 *  1. The player should avoid lava(red stuff) and monsters
 *  2. Once it touches one of these, the level resets
 *  3. To complete a level, all coins should be collected
 */

// ────────────────────────────────────────────────────────────────────────────────

// create an object which tracks one of the specified keys is being pressed
function trackKeys(keys) {
    const pressed = Object.create(null);
    function track(event) {
        if (keys.includes(event.key)) {
            // if the 'key' is pressed(event.type === 'keydown'), it's value is true
            // if the 'key' is left(event.type === 'keyup'), it's value is false
            pressed[event.key] = event.type === 'keydown';
            event.preventDefault();
        }
    }
    window.addEventListener('keydown', track);
    window.addEventListener('keyup', track);
    return pressed;
}
const arrowKeys = trackKeys(['ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown']);

// check if 2 actors overlap on both axis
function overlap(actor1, actor2) {
    return actor1.pos.x + actor1.size.x > actor2.pos.x
        && actor1.pos.x < actor2.pos.x + actor2.size.x
        && actor1.pos.y + actor1.size.y > actor2.pos.y
        && actor1.pos.y < actor2.pos.y + actor2.size.y;
}

//
// ─── ACTORS ─────────────────────────────────────────────────────────────────────
//

// rectangle sizes and speeds are described with vectors
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

const PLAYER_XSPEED = 7;
const LAVA_SLOWDOWN = { x: 7, y: 1.6 };
const GRAVITY = 30;
const JUMP_SPEED = 17;
class Player {
    constructor(pos, speed) {
        this.pos = pos;
        this.speed = speed;
    }

    static create(pos) {
        return new Player(pos.plus(new Vec(0, -0.5)), new Vec(0, 0));
    }

    touchesLava(state) {
        if (state.level.touches(this.pos, this.size, 'lava')) {
            return true;
        }
        for (const actor of state.actors) {
            if (actor.type === 'lava' && overlap(actor, this)) {
                return true;
            }
        }
        return false;
    }

    // returns the speed on the 'x' axis
    getXSpeed(state, keys) {
        let speed = 0;
        if (keys.ArrowLeft) speed -= PLAYER_XSPEED;
        if (keys.ArrowRight) speed += PLAYER_XSPEED;
        if (this.touchesLava(state)) speed /= LAVA_SLOWDOWN.x;
        return speed;
    }

    // the time in the air is not controlled, so we don't need 'keys'
    getYSpeed(state, time) {
        let speed = this.speed.y + GRAVITY * time;
        if (this.touchesLava(state)) speed /= LAVA_SLOWDOWN.y;
        return speed;
    }

    update(time, state, keys) {
        let { pos } = this;
        const xSpeed = this.getXSpeed(state, keys);
        const movedX = pos.plus(new Vec(xSpeed * time, 0));
        // if 'movedX' doesn't intersect any wall, set the players position to 'movedX'
        if (!state.level.touches(movedX, this.size, 'wall')) {
            pos = movedX;
        }
        // adding the 'GRAVITY' to 'ySpeed' means that the speed is directed down
        // (the 'y' axis is inverted in our game)
        let ySpeed = this.getYSpeed(state, time);
        // if the player touches lava, reduce it's speed on the 'y' axis
        const movedY = pos.plus(new Vec(0, ySpeed * time));
        // if the computed place 'movedY' doesn't hit any walls, "move the player to that position"
        if (!state.level.touches(movedY, this.size, 'wall')) {
            pos = movedY;
        // if it does hit something, don't update player's position and modify the 'ySpeed'
        // if the ArrowUp key is pressed and the player is on the ground(ySpeed > 0)
        // set it's speed to negative 'JUMP_SPEED' in order to jump
        } else if (keys.ArrowUp && ySpeed > 0) {
            ySpeed = -JUMP_SPEED;
        // else, the player bumped into something, so stop the motion on the 'y' axis
        } else {
            ySpeed = 0;
        }
        // if the player falls into lava, reduce it's vertical speed
        return new Player(pos, new Vec(xSpeed, ySpeed));
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

    // if the player touches lava, the game is lost
    collide(state) {
        return new State(state.level, state.actors, 'lost');
    }

    update(time, state) {
        // compute the next position with the state, time and lava's speed
        const newPos = this.pos.plus(this.speed.times(time));
        // if the next position doesn't intersect a wall
        // move the lava block(return a new Lava Object with the new position)
        if (!state.level.touches(newPos, this.size, 'wall')) {
            return new Lava(newPos, this.speed, this.reset);
        }
        // handle situations when the new position intersects a wall
        // if this is a dripping lava('v' character)
        if (this.reset) {
            return new Lava(this.reset, this.speed, this.reset);
        }
        // invert the direction of moving lava blocks
        return new Lava(this.pos, this.speed.times(-1));
    }
}
Lava.prototype.type = 'lava';
Lava.prototype.size = new Vec(1, 1);

const WOBBLE_SPEED = 8;
const WOBBLE_DIST = 0.07;
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

    // collect the coin and return a new state
    // if all coins are collected the level is won
    collide(state) {
        const filtered = state.actors.filter(a => a !== this);
        let { status } = state;
        if (!filtered.some(a => a.type === 'coin')) status = 'won';
        return new State(state.level, filtered, status);
    }

    update(time) {
        // generate a random wobble and position
        const wobble = this.wobble + WOBBLE_SPEED * time;
        const wobblePos = Math.sin(wobble) * WOBBLE_DIST;
        // move the coin to that position
        return new Coin(this.basePos.plus(new Vec(0, wobblePos)),
            this.basePos, wobble);
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

    // tells whether a rectangle specified by a position and it's size
    // touches a block of a given type
    touches(pos, size, type) {
        // get the coordinates for the space occupied by the rectangle
        const xStart = Math.floor(pos.x);
        const xEnd = Math.ceil(pos.x + size.x);
        const yStart = Math.floor(pos.y);
        const yEnd = Math.ceil(pos.y + size.y);

        for (let y = yStart; y < yEnd; y++) {
            for (let x = xStart; x < xEnd; x++) {
                // check if the rectangle is outside the map
                const isOutside = x < 0 || x >= this.width
                               || y < 0 || y >= this.height;
                // get the type of the current block
                const here = isOutside ? 'wall' : this.rows[y][x];
                if (here === type) return true;
            }
        }
        return false;
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

    update(time, keys) {
        // update the position of all actors
        const actors = this.actors.map(actor => actor.update(time, this, keys));
        let newState = new State(this.level, actors, this.status);
        if (newState.status !== 'playing') return newState;
        // if the player touches lava, the game is lost
        const { player } = newState;
        if (this.level.touches(player.pos, player.size, 'lava')) {
            return new State(this.level, actors, 'lost');
        }
        // if the player touches(overlaps) any other actor, execute the collision outcome
        // e.g. a coin is collected; if it touched a moving lava, the level is lost
        for (const actor of actors) {
            if (actor !== player && overlap(actor, player)) {
                newState = actor.collide(newState);
            }
        }
        return newState;
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

    clear() { this.dom.remove(); }

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
}

//
// ────────────────────────────────────────────────────────────────── DRAWING ─────
//
//
// ─── RUNNING THE GAME ───────────────────────────────────────────────────────────
//

// helper(wrapper) function to animate the elements on the page
// the animation stops when the 'frameFunc' returns false
function runAnimation(frameFunc) {
    let lastTime = null;
    function frame(time) {
        if (lastTime != null) {
            // use the Math.min function to counter the situations
            // when the browser tab/window is hidden and the difference
            // between 'time' and 'lastTime' gets ridiculously high
            // also convert milliseconds to seconds
            const timeStep = Math.min(time - lastTime, 100) / 1000;
            if (frameFunc(timeStep) === false) return;
        }
        lastTime = time;
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

/**
 * Returns a promise which resolves with the end-game status('lost' || 'won')
 * @param {instanceof Level} level an argument created with 'Level' constructor
 * @param {Object} Display a constructor to draw the level
 */
function runLevel(level, Display) {
    const display = new Display(document.body, level);
    let state = State.start(level);
    // it's used to pause 1sec when a level is completed(lost or won)
    let ending = 1;
    return new Promise((resolve) => {
        runAnimation((time) => {
            state = state.update(time, arrowKeys);
            display.syncState(state);
            // if the status is playing, continue the animation
            if (state.status === 'playing') {
                return true;
            }
            // by subtracting the step of time from 'ending'
            // we give the player 1sec to observe the changes after winning/losing a level
            if (ending > 0) {
                ending -= time;
                return true;
            }
            // after 1sec, clear the level and stop the animation
            display.clear();
            resolve(state.status);
            return false;
        });
    });
}

async function runGame(plans, Display) {
    for (let level = 0; level < plans.length;) {
        const status = await runLevel(new Level(plans[level]), Display);
        if (status === 'won') level += 1;
    }
    console.log('You\'ve won!');
}

//
// ───────────────────────────────────────────────────────── RUNNING THE GAME ─────
//

const simpleLevel = new Level(simpleLevelPlan);
console.log(simpleLevel);

runGame(GAME_LEVELS, DOMDisplay);

// TODO:
// IN PROCESS: Game Over(3 lives per level)
// 2. Pausing the game
// DONE: Slow down motion in lava
// 4. A Monster which moves and disappears if the player jumps on it
