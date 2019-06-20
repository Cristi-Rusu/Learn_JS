//
// ────────────────────────────────────────────────────────────────── I ──────────
//   :::::: P L A T F O R M   G A M E : :  :   :    :     :        :          :
// ────────────────────────────────────────────────────────────────────────────
//

/* eslint-disable no-unused-vars */
/* eslint-disable no-use-before-define */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-await-in-loop */
/* global simpleLevelPlan, MonsterLevel, GAME_LEVELS:true */

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
    pressed.listen = () => {
        window.addEventListener('keydown', track);
        window.addEventListener('keyup', track);
    };
    pressed.removeListener = () => {
        window.removeEventListener('keydown', track);
        window.removeEventListener('keyup', track);
        for (const key of keys) {
            delete pressed[key];
        }
    };
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

function flipHorizontally(context, around) {
    context.translate(around, 0);
    context.scale(-1, 1);
    context.translate(-around, 0);
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
        return new State(state.level, state.actors, 'lost', state.lives - 1);
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
        return new State(state.level, filtered, status, state.lives);
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


class Monster {
    constructor(pos, speed) {
        this.pos = pos;
        this.speed = speed;
    }

    static create(pos) {
        return new Monster(pos.plus(new Vec(0, -1)), new Vec(4, 0));
    }

    // if the player touches a Monster, the game is lost
    collide(state) {
        const {
            player, actors, status, level, lives,
        } = state;
        const playerBottom = player.pos.y + player.size.y;
        // Monster's top is 85% of it's body, because the player has to intersect
        // it's body to call the 'collide' method
        const monsterTop = this.pos.y + this.size.y * 0.15;
        // if the player is above the Monster('y' axis is inverted)
        if (playerBottom < monsterTop) {
            const filtered = actors.filter(actor => actor !== this);
            return new State(level, filtered, status, lives);
        }
        return new State(level, actors, 'lost', lives - 1);
    }

    update(time, state) {
        // compute the next position with the state, time and Monster's speed
        const newPos = this.pos.plus(this.speed.times(time));
        // if the next position doesn't intersect a wall
        // move the lava block(return a new Lava Object with the new position)
        if (!state.level.touches(newPos, this.size, 'wall')) {
            return new Monster(newPos, this.speed);
        }
        // invert the direction of moving the monster it meets a wall
        return new Monster(this.pos, this.speed.times(-1));
    }
}
Monster.prototype.type = 'monster';
Monster.prototype.size = new Vec(1.4, 1.6);

const levelChars = {
    '.': 'empty',
    '#': 'wall',
    '+': 'lava',
    '@': Player,
    '=': Lava,
    '|': Lava,
    v: Lava,
    o: Coin,
    M: Monster,
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
    constructor(level, actors, status, lives) {
        this.level = level;
        this.actors = actors;
        this.status = status;
        this.lives = lives;
    }

    get player() {
        return this.actors.find(a => a.type === 'player');
    }

    static start(level, lives = 3) {
        return new State(level, level.startActors, 'playing', lives);
    }

    update(time, keys) {
        // update the position of all actors
        const actors = this.actors.map(actor => actor.update(time, this, keys));
        let newState = new State(this.level, actors, this.status, this.lives);
        if (newState.status !== 'playing') return newState;
        // if the player touches lava, the game is lost
        const { player } = newState;
        if (this.level.touches(player.pos, player.size, 'lava')) {
            return new State(this.level, actors, 'lost', this.lives - 1);
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

function drawLives(lifeNumber) {
    const lives = [];
    for (let i = 0; i < 3; i++) {
        const life = elt('div', { class: 'life' });
        if (i < lifeNumber) life.classList = 'life active';
        life.style.left = `${10 + 26 * i}px`;
        lives.push(life);
    }
    return elt('div', { class: 'lives' }, ...lives);
}

// a display is created by giving it a parent node and a level to draw
class DOMDisplay {
    constructor(parent, level, lives) {
        this.lives = lives;
        this.display = elt('div', { class: 'level' }, drawGrid(level));
        this.game = elt('div', { class: 'game' },
            elt('div', { class: 'pause-btn' }),
            this.display);
        this.actorLayer = null;
        this.livesLayer = null;
        parent.appendChild(this.game);
    }

    clear() { this.game.remove(); }

    scrollPlayerIntoView(state) {
        const width = this.display.clientWidth;
        const height = this.display.clientHeight;
        const margin = width / 4;
        // The viewport
        // the distance scrolled from the top-left corner
        const left = this.display.scrollLeft;
        const top = this.display.scrollTop;
        const right = width + left;
        const bottom = width + top;

        const { player } = state;
        // get the center point of the player body
        const center = player.pos.plus(player.size.times(0.5)).times(SCALE);

        // scroll the viewport if the player is near the edges(les than 1/3 of viewport)
        if (center.x < left + margin) {
            this.display.scrollLeft = center.x - margin;
        } else if (center.x > right - margin) {
            // subtract the 'width' because we set the Left scroll position
            this.display.scrollLeft = center.x + margin - width;
        }
        if (center.y < top + margin) {
            this.display.scrollTop = center.y - margin;
        } else if (center.y > bottom - margin) {
            // subtract the 'height' because we set the Top scroll position
            this.display.scrollTop = center.y + margin - height;
        }
    }

    syncState(state) {
        if (this.livesLayer) this.livesLayer.remove();
        this.livesLayer = drawLives(state.lives);
        this.game.prepend(this.livesLayer);
        // create a new actorLayer
        if (this.actorLayer) this.actorLayer.remove();
        this.actorLayer = drawActors(state.actors);
        this.display.appendChild(this.actorLayer);
        // update the background color depending on the status
        this.display.className = `level ${state.status}`;
        this.scrollPlayerIntoView(state);
    }
}

const otherSprites = document.createElement('img');
otherSprites.src = 'http://eloquentjavascript.net/img/sprites.png';
const playerSprites = document.createElement('img');
playerSprites.src = 'http://eloquentjavascript.net/img/player.png';
// the player sprite is 24px to give some room for hands and legs
// (4px on one side and 4px on the other)
const playerXOverlap = 4;
const monsterSprites = document.createElement('img');
monsterSprites.src = './js/platform_game/images/monster.png';
const monsterXOverlap = 6;
const livesSprites = document.createElement('img');
livesSprites.src = './js/platform_game/images/lives.png';
class CanvasDisplay {
    constructor(parent, level, lives) {
        this.lives = lives;
        this.canvas = elt('canvas', {});
        this.canvas.width = Math.min(800, level.width * SCALE);
        this.canvas.height = Math.min(650, level.height * SCALE);
        this.game = elt('div', { class: 'game' },
            elt('div', { class: 'pause-btn' }),
            this.canvas);
        parent.appendChild(this.game);

        this.cx = this.canvas.getContext('2d');
        this.flipPlayer = false;
        this.flipMonster = false;

        this.viewport = {
            left: 0,
            top: 0,
            width: this.canvas.width / SCALE,
            height: this.canvas.height / SCALE,
        };
    }

    clear() { this.game.remove(); }

    updateViewport(state) {
        const view = this.viewport;
        const margin = view.width / 4;
        const { player } = state;
        const center = player.pos.plus(player.size.times(0.5));

        // use Math.max and Math.min to make sure the viewport doesn't show space outside the level
        if (center.x < view.left + margin) {
            view.left = Math.max(center.x - margin, 0);
        } else if (center.x > view.left + view.width - margin) {
            view.left = Math.min(center.x + margin - view.width,
                state.level.width - view.width);
        }

        if (center.y < view.top + margin) {
            view.top = Math.max(center.y - margin, 0);
        } else if (center.y > view.top + view.height - margin) {
            view.top = Math.min(center.y + margin - view.height,
                state.level.height - view.height);
        }
    }

    // change the color of the sky depending on the status of the game
    clearDisplay(status) {
        if (status === 'won') {
            this.cx.fillStyle = 'rgb(68, 191, 255)';
        } else if (status === 'lost') {
            this.cx.fillStyle = 'rgb(44, 136, 214)';
        } else {
            this.cx.fillStyle = 'rgb(52, 166, 251)';
        }
        this.cx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBackground(level) {
        const {
            left, top, width, height,
        } = this.viewport;
        const xStart = Math.floor(left);
        const xEnd = Math.ceil(left + width);
        const yStart = Math.floor(top);
        const yEnd = Math.ceil(top + height);

        for (let y = yStart; y < yEnd; y++) {
            for (let x = xStart; x < xEnd; x++) {
                const tile = level.rows[y][x];
                // eslint-disable-next-line no-continue
                if (tile === 'empty') continue;
                const screenX = (x - left) * SCALE;
                const screenY = (y - top) * SCALE;
                // if the tile is lava, the sprite's 'x' coordinate is 'SCALE'(20px)
                // else means it's a wall and the coordinate is 0
                const tileX = tile === 'lava' ? SCALE : 0;
                this.cx.drawImage(otherSprites,
                    tileX, 0, SCALE, SCALE,
                    screenX, screenY, SCALE, SCALE);
            }
        }
    }

    drawPlayer(player, x, y, width, height) {
        width += playerXOverlap * 2;
        x -= playerXOverlap;
        if (player.speed.x !== 0) {
            this.flipPlayer = player.speed.x < 0;
        }
        // standing sprite
        let tile = 8;
        if (player.speed.y !== 0) {
            // jumping sprite
            tile = 9;
        } else if (player.speed.x !== 0) {
            // switch running sprites(8 of them) each 60 milliseconds
            tile = Math.floor(Date.now() / 60) % 8;
        }
        // save the current transformations to revert after flipping the player
        // (the whole axis is flipped)
        this.cx.save();
        if (this.flipPlayer) {
            flipHorizontally(this.cx, x + width / 2);
        }
        // get the 'x' position in the sprites
        const tileX = tile * width;
        this.cx.drawImage(playerSprites,
            tileX, 0, width, height,
            x, y, width, height);
        this.cx.restore();
    }

    drawMonster(monster, x, y, width, height) {
        width += monsterXOverlap * 2;
        x -= monsterXOverlap;
        if (monster.speed.x !== 0) {
            // the sprite is looking towards left,
            // so flip it when the Monster moves to the right
            this.flipMonster = monster.speed.x > 0;
        }
        // switch sprites(4 of them) each 120 milliseconds
        let tile = Math.floor(Date.now() / 120) % 4;
        if (tile === 2) tile = 3;
        this.cx.save();
        if (this.flipMonster) {
            flipHorizontally(this.cx, x + width / 2);
        }
        const tileX = tile * width;
        this.cx.drawImage(monsterSprites,
            tileX, 0, width, height,
            x, y, width, height);
        this.cx.restore();
    }

    drawActors(actors) {
        for (const actor of actors) {
            const width = actor.size.x * SCALE;
            const height = actor.size.y * SCALE;
            const x = (actor.pos.x - this.viewport.left) * SCALE;
            const y = (actor.pos.y - this.viewport.top) * SCALE;
            if (actor.type === 'player') {
                this.drawPlayer(actor, x, y, width, height);
            } else if (actor.type === 'monster') {
                this.drawMonster(actor, x, y, width, height);
            } else {
                // if it's a coin get the 3rd sprite
                // otherwise it's lava and get the 2nd sprite
                const tileX = (actor.type === 'coin' ? 2 : 1) * SCALE;
                this.cx.drawImage(otherSprites,
                    tileX, 0, width, height,
                    x, y, width, height);
            }
        }
    }

    drawLives(lives) {
        for (let i = 0; i < 3; i++) {
            // on 0px is the full heart, and on 60px is the empty heart
            const tileX = i < lives ? 0 : 50;
            this.cx.drawImage(livesSprites,
                tileX, 0, 25, 25,
                10 + 30 * i, 10, 25, 25);
        }
    }

    syncState(state) {
        this.updateViewport(state);
        this.clearDisplay(state.status);
        this.drawBackground(state.level);
        this.drawActors(state.actors);
        this.drawLives(state.lives);
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
function runLevel(level, Display, lives) {
    arrowKeys.listen();
    const display = new Display(document.body, level, lives);
    const pauseBtn = Array.from(display.game.children).find(node => (
        node.className === 'pause-btn'
    ));
    let state = State.start(level, lives);
    // it's used to pause 1sec when a level is completed(lost or won)
    let ending = 1;
    let pause = 'no';
    return new Promise((resolve) => {
        function frame(time) {
            // pause the game(stop the animation)
            if (pause === 'pausing') {
                pause = 'yes';
            } else if (pause === 'yes') {
                return false;
            }

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
            resolve({
                status: state.status,
                lvlWidth: `${display.game.clientWidth}px`,
                lvlHeight: `${display.game.clientHeight}px`,
            });
            window.removeEventListener('keydown', escHandler);
            pauseBtn.removeEventListener('click', pauseHandler);
            arrowKeys.removeListener();
            // after 1sec, stop the animation
            display.clear();
            return false;
        }

        function pauseHandler() {
            const pauseMess = elt('div', { class: 'message message__pause' });
            pauseMess.textContent = 'Pause';

            if (pause === 'no') {
                // display the pause message
                pause = 'pausing';
                display.game.appendChild(pauseMess);
            } else if (pause === 'yes') {
                pause = 'no';
                const pauseWindow = document.querySelector('.message__pause');
                if (pauseWindow) pauseWindow.remove();
                // run the animation again on the same state
                runAnimation(frame);
            } else {
                pause = 'yes';
            }
        }
        function escHandler(event) {
            if (event.key !== 'Escape') return;
            pauseHandler();
        }
        // pause/unpause when 'esc' is pressed
        window.addEventListener('keydown', escHandler);
        pauseBtn.addEventListener('click', pauseHandler);
        runAnimation(frame);
    });
}

async function runGame(plans, Display) {
    let lives;
    const message = elt('div', { class: 'message message__win' });
    message.textContent = 'You Win!';
    for (let level = 0; level < plans.length;) {
        if (lives == null) lives = 3;
        const { status, lvlWidth, lvlHeight } = await runLevel(
            new Level(plans[level]), Display, lives,
        );
        if (status === 'won') {
            level += 1;
            lives = 3;
        } else {
            lives -= 1;
            if (lives === 0) {
                level = 0;
                lives = 3;
            }
        }
        message.style.width = lvlWidth;
        message.style.height = lvlHeight;
    }
    document.body.append(message);
}

//
// ───────────────────────────────────────────────────────── RUNNING THE GAME ─────
//

const simpleLevel = new Level(simpleLevelPlan);
console.log(simpleLevel);

// runGame([MonsterLevel, ...GAME_LEVELS], DOMDisplay);
runGame([MonsterLevel, ...GAME_LEVELS], CanvasDisplay);
