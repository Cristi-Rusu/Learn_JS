//
// ──────────────────────────────────────────────────────────────────────── I ──────────
//   :::::: P I X E L   A R T   E D I T O R : :  :   :    :     :        :          :
// ──────────────────────────────────────────────────────────────────────────────────
//

/* eslint-disable consistent-return */

// ─── CONSTANTS ──────────────────────────────────────────────────────────────────

// the size of a pixel on the canvas
const SCALE = 10;
// used to get the adjacent pixels(excluding diagonal) in the grid in the 'fill' function
const AROUND = [
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
];

//
// ─── FUNCTIONS ──────────────────────────────────────────────────────────────────
//

function elt(type, props, ...children) {
    const dom = document.createElement(type);
    if (props) Object.assign(dom, props);
    for (const child of children) {
        dom.append(child);
    }
    return dom;
}

// get the position of the pointer inside a canvas, given a mouse/touch event
function pointerPosition(event, canvas) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: Math.floor((event.clientX - rect.left) / SCALE),
        y: Math.floor((event.clientY - rect.top) / SCALE),
    };
}

function drawPicture(picture, canvas, scale) {
    canvas.width = picture.width * scale;
    canvas.height = picture.height * scale;
    const cx = canvas.getContext('2d');

    for (let y = 0; y < picture.height; y++) {
        for (let x = 0; x < picture.width; x++) {
            // get the color for the fill style
            cx.fillStyle = picture.pixel(x, y);
            // each pixes is a rectangle with 'scale' width and height
            cx.fillRect(x * scale, y * scale, scale, scale);
        }
    }
}

//
// ──────────────────────────────────────────────────────────────── FUNCTIONS ─────
//
//
// ─── COMPONENTS ─────────────────────────────────────────────────────────────────
//

class Picture {
    constructor(width, height, pixels) {
        this.width = width;
        this.height = height;
        this.pixels = pixels;
    }

    static empty(width, height, color) {
        const pixels = new Array(width * height).fill(color);
        return new Picture(width, height, pixels);
    }

    pixel(x, y) {
        return this.pixels[x + y * this.width];
    }

    draw(pixels) {
        const copy = this.pixels.slice();
        for (const { x, y, color } of pixels) {
            copy[x + y * this.width] = color;
        }
        return new Picture(this.width, this.height, copy);
    }
}


class PictureCanvas {
    constructor(picture, pointerDown) {
        this.dom = elt('canvas', {
            onmousedown: event => this.mouse(event, pointerDown),
            ontouchstart: event => this.touch(event, pointerDown),
        });
        this.syncState(picture);
    }

    syncState(picture) {
        if (this.picture === picture) return;
        this.picture = picture;
        drawPicture(this.picture, this.dom, SCALE);
    }

    mouse(downEvent, onDown) {
        // if other button than the left one was clicked
        if (downEvent.button !== 0) return;
        let pos = pointerPosition(downEvent, this.dom);
        // 'onDown' is a callback function which returns a function to execute
        const onMove = onDown(pos);
        // not all the handlers return a 'onMove' function(i.e. pick, fill)
        if (!onMove) return;
        // handler function to execute on mousemove
        const move = (moveEvent) => {
            // if the left button was released, remove the listener
            if (moveEvent.buttons === 0) {
                this.dom.removeEventListener('mousemove', move);
            } else {
                const newPos = pointerPosition(moveEvent, this.dom);
                // if the position didn't change, return
                if (newPos.x === pos.x && newPos.y === pos.y) return;
                // update the position('pos')
                // then draw the pixels/rectangle/etc. on the new position
                pos = newPos;
                onMove(newPos);
            }
        };
        this.dom.addEventListener('mousemove', move);
    }

    // it's similar to 'PictureCanvas.mouse', but uses the touch events
    touch(startEvent, onDown) {
        // to get the position of the touch we should access the 'touches' property of the touch event
        let pos = pointerPosition(startEvent.touches[0], this.dom);
        const onMove = onDown(pos);
        startEvent.preventDefault();
        if (!onMove) return;
        const move = (moveEvent) => {
            const newPos = pointerPosition(moveEvent.touches[0], this.dom);
            if (newPos.x === pos.x && newPos.y === pos.y) return;
            pos = newPos;
            onMove(newPos);
        };
        const end = () => {
            this.dom.removeEventListener('touchmove', move);
            this.dom.removeEventListener('touchend', end);
        };
        this.dom.addEventListener('touchmove', move);
        this.dom.addEventListener('touchend', end);
    }
}


// ─── CONTROLS ───────────────────────────────────────────────────────────────────

// ─── Drawing Tools ──────────────────────────────────────────────────────────────
function draw(pos, state, dispatch) {
    function drawPixel({ x, y }, currState) {
        const drawn = { x, y, color: currState.color };
        // pass the state a new picture, by drawing a pixel on the old one
        dispatch({ picture: currState.picture.draw([drawn]) });
    }
    drawPixel(pos, state);
    return drawPixel;
}

function rectangle(start, state, dispatch) {
    // while dragging the rectangle is redrawn from the original state
    function drawRectangle(pos) {
        const xStart = Math.min(start.x, pos.x);
        const yStart = Math.min(start.y, pos.y);
        const xEnd = Math.max(start.x, pos.x);
        const yEnd = Math.max(start.y, pos.y);
        const drawn = [];

        for (let y = yStart; y <= yEnd; y++) {
            for (let x = xStart; x <= xEnd; x++) {
                drawn.push({ x, y, color: state.color });
            }
        }
        // pass the state a new picture, by drawing a rectangle on the old image
        dispatch({ picture: state.picture.draw(drawn) });
    }
    drawRectangle(start);
    return drawRectangle;
}

function pick(pos, state, dispatch) {
    dispatch({ color: state.picture.pixel(pos.x, pos.y) });
}

// flood fill tool
function fill({ x, y }, state, dispatch) {
    const targetColor = state.picture.pixel(x, y);
    const drawn = [{ x, y, color: state.color }];
    // add the adjacent pixels with the 'targetColor' until there are no such pixels left
    for (let i = 0; i < drawn.length; i++) {
        for (const { dx, dy } of AROUND) {
            const adjacentX = drawn[i].x + dx;
            const adjacentY = drawn[i].y + dy;
            // if the coordinates are inside the picture(0 <= coordinate < 'picture dimension')
            if (adjacentX >= 0 && adjacentX < state.picture.width
                && adjacentY >= 0 && adjacentY < state.picture.height
                // if the color of the adjacent pixel equal to the 'targetColor'
                && state.picture.pixel(adjacentX, adjacentY) === targetColor
                // if there are no pixels with the same coordinates in the 'drawn' array
                && !drawn.some(p => p.x === adjacentX && p.y === adjacentY)) {
                drawn.push({ x: adjacentX, y: adjacentY, color: state.color });
            }
        }
    }
    dispatch({ picture: state.picture.draw(drawn) });
}
// ──────────────────────────────────────────────────────────── Drawing Tools ─────
class ToolSelect {
    constructor(state, { tools, dispatch }) {
        this.select = elt('select', {
            onchange: () => dispatch({ tool: this.select.value }),
        }, ...Object.keys(tools).map(name => (
            // create the options with the name of the tools
            elt('option', { selected: name === state.tool }, name)
        )));
        this.dom = elt('label', {},
            '🖌Tool: ',
            this.select);
    }

    syncState(state) { this.select.value = state.tool; }
}

class ColorSelect {
    constructor(state, { dispatch }) {
        this.input = elt('input', {
            type: 'color',
            value: state.color,
            onchange: () => dispatch({ color: this.input.value }),
            style: 'position: relative; top: 3px;',
        });
        this.dom = elt('label', {},
            '🎨Color: ',
            this.input);
    }

    syncState(state) { this.input.value = state.color; }
}

class SaveButton {
    constructor(state) {
        this.picture = state.picture;
        this.dom = elt('button', {
            onclick: () => this.save(),
        }, '💾Save');
    }

    save() {
        const canvas = elt('canvas');
        // draw the picture with the scale = 1px
        drawPicture(this.picture, canvas, 1);
        // create the link and click it automatically
        const link = elt('a', {
            href: canvas.toDataURL(),
            download: 'pixel-art.png',
        });
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    syncState(state) { this.picture = state.picture; }
}

// ─── Load Image ─────────────────────────────────────────────────────────────────
function pictureFromImage(image) {
    // limit the size of the image to 100px w/h
    const width = Math.min(100, image.width);
    const height = Math.min(100, image.height);
    const canvas = elt('canvas', { width, height });
    const cx = canvas.getContext('2d');
    cx.drawImage(image, 0, 0);
    // get the data from the 'width' * 'height' section of the image
    const { data } = cx.getImageData(0, 0, width, height);
    const pixels = [];

    function hex(n) {
        // 'padStart' prepends '0' is the string is shorter than 2
        // i.e. '5' -> '05', 'C' -> '0C'
        return n.toString(16).padStart(2, '0');
    }

    // 'i' is added by 4, because there are 4 color channels(r, g, b, a)
    for (let i = 0; i < data.length; i += 4) {
        const [r, g, b, a] = data.slice(i, i + 4);
        // create the hex color
        pixels.push(`#${hex(r) + hex(g) + hex(b) + hex(a)}`);
    }

    return new Picture(width, height, pixels);
}

function finishLoad(file, dispatch) {
    if (file == null) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener('load', () => {
        const image = elt('img', {
            src: reader.result,
            onload: () => dispatch({
                picture: pictureFromImage(image),
            }),
        });
    });
}

function startLoad(dispatch) {
    const input = elt('input', {
        type: 'file',
        onchange: () => finishLoad(input.files[0], dispatch),
    });
    document.body.appendChild(input);
    input.click();
    input.remove();
}
// ─────────────────────────────────────────────────────────────── Load Image ─────
// the load button doesn't need to know anything about the application
// so it's stateless('_' instead of 'state')
class LoadButton {
    constructor(_, { dispatch }) {
        this.dom = elt('button', {
            onclick: () => startLoad(dispatch),
        }, '📁Load');
    }
}

class UndoButton {
    constructor(state, { dispatch }) {
        this.dom = elt('button', {
            onclick: () => dispatch({ undo: true }),
            disabled: state.done.length === 0,
        }, '⮪ Undo');
    }

    // disable it when there is no history to revert to
    syncState(state) {
        this.dom.disabled = state.done.length === 0;
    }
}
// ───────────────────────────────────────────────────────────────── CONTROLS ─────


class PixelEditor {
    constructor(state, config) {
        const { tools, controls, dispatch } = config;
        this.state = state;
        this.canvas = new PictureCanvas(state.picture, (pos) => {
            const tool = tools[this.state.tool];
            // some tools return a function to handle movement
            // the tool first draws what it need to, then returns(or not) a handler function
            const onMove = tool(pos, this.state, dispatch);
            if (onMove) return newPos => onMove(newPos, this.state);
        });
        this.controls = controls.map(Control => new Control(state, config));
        this.dom = elt('div', { style: 'width: fit-content; margin: 0 auto;' },
            this.canvas.dom,
            elt('br'),
            ...this.controls.reduce((arr, ctrl) => (
                arr.concat(' ', ctrl.dom)
            ), []));
    }

    syncState(state) {
        this.state = state;
        this.canvas.syncState(state.picture);
        for (const ctrl of this.controls) {
            // update the stateful components
            if (ctrl.syncState) ctrl.syncState(state);
        }
    }
}

//
// ─────────────────────────────────────────────────────────────── COMPONENTS ─────
//
//
// ─── RUNNING ────────────────────────────────────────────────────────────────────
//

// eslint-disable-next-line no-unused-vars
function updateState(state, action) {
    // copy the state and overwrite it's properties with the action props
    return Object.assign({}, state, action);
}

function historyUpdateState(state, action) {
    // revert to the previously stored picture and slice it from the 'done' array
    if (action.undo === true) {
        if (state.done.length === 0) return state;
        return Object.assign({}, state, {
            picture: state.done[0],
            done: state.done.slice(1),
            // 'doneAt' is set to 0, so that the next change is guaranteed to store the picture back in the history
            doneAt: 0,
        });
    }
    // update the undo history maximum each second(no more frequently)
    if (action.picture && state.doneAt < Date.now() - 1000) {
        return Object.assign({}, state, action, {
            done: [state.picture, ...state.done],
            doneAt: Date.now(),
        });
    }
    return Object.assign({}, state, action);
}

let editorState = {
    tool: 'draw',
    color: '#000000',
    picture: Picture.empty(60, 40, '#f0f0f0'),
    done: [],
    doneAt: 0,
};
const App = new PixelEditor(editorState, {
    tools: {
        draw, fill, rectangle, pick,
    },
    controls: [ToolSelect, ColorSelect, SaveButton, LoadButton, UndoButton],
    dispatch(action) {
        editorState = historyUpdateState(editorState, action);
        App.syncState(editorState);
    },
});

document.body.appendChild(App.dom);
