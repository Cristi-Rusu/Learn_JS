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

// gets the fractional part of a number
function getFraction(n) {
    const s = String(n);
    let number;
    if (s.indexOf('.') === -1) {
        number = 0;
    } else {
        number = Number(s.slice(s.indexOf('.')));
    }
    return number;
}

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

/**
 * Draws a 'picture' on a given 'canvas', setting it's width and height according to the 'scale'
 * If given a 'previous' instanceof 'Picture', it will draw only the difference between the images
 * @param {instanceof Picture} picture the picture that needs to be drawn on the canvas
 * @param {instanceof Node} canvas the canvas on which to draw the picture
 * @param {number} scale the which determines how big a picture pixel will look on the screen
 * @param {instanceof Picture} previous is used to draw the image more efficiently and can be omitted
 */
function drawPicture(picture, canvas, scale, previous) {
    // if no previous picture was provided or it's dimensions don't coincide
    // it is needed to not change the canvas' width and height every time, because this erases it's content
    if (previous == null
        || previous.width !== picture.width
        || previous.height !== picture.height) {
        canvas.width = picture.width * scale;
        canvas.height = picture.height * scale;
        // set 'previous' to 'null' because it's dimensions are different from the 'picture'
        previous = null;
    }

    const cx = canvas.getContext('2d');
    for (let y = 0; y < picture.height; y++) {
        for (let x = 0; x < picture.width; x++) {
            const color = picture.pixel(x, y);
            // draw a pixel only if the 'previous' pixel is different from the new picture's one
            // or there is no 'previous'
            if (previous == null || previous.pixel(x, y) !== color) {
                // get the color for the fill style
                cx.fillStyle = picture.pixel(x, y);
                // each pixes is a rectangle with 'scale' width and height
                cx.fillRect(x * scale, y * scale, scale, scale);
            }
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
        drawPicture(picture, this.dom, SCALE, this.picture);
        this.picture = picture;
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

// draws a line, by iterating on a reference axis and
// adding the necessary number of pixels on each row/column
// the ratio of vertical and horizontal distances determines this number by
// using the remainder to draw more or less pixels, depending on the remainder's value
function line(start, state, dispatch) {
    function drawLine(to) {
        const xDistance = Math.abs(to.x - start.x) + 1;
        const yDistance = Math.abs(to.y - start.y) + 1;
        const drawn = [];

        // remainder, the decimal part
        let rem = 0;
        let xPos = start.x;
        let yPos = start.y;
        let ratio = xDistance / yDistance;
        if (ratio > 0.5) {
            // the reference axis is 'y'
            for (let yCoord = 0; yCoord < yDistance; yCoord++) {
                // 'dy' is positive if the starting point(start) is above 'to' and vice versa
                const dy = start.y < to.y ? yCoord : -yCoord;
                // the number of pixel on each row(on the y axis)
                let pixNum;
                if (rem >= 0.5) {
                    pixNum = ratio - (1 - rem);
                } else {
                    pixNum = ratio + rem;
                }
                rem = getFraction(pixNum);

                const toDraw = Math.round(pixNum);
                if (toDraw === 0) {
                // if 'toDraw' equals 0, means we have to draw a pixel on the vertical axis
                // to do this, it's position should be on the same 'x' coordinate
                    drawn.push({ x: xPos, y: yPos + dy, color: state.color });
                } else {
                    // 'xCoord' is relative to the current position of 'x'(xPos)
                    for (let xCoord = 0; xCoord < toDraw; xCoord++) {
                        // 'dx' is positive if the starting point is to the left of 'to' and vice versa
                        const dx = start.x < to.x ? xCoord : -xCoord;
                        drawn.push({
                            x: xPos + dx,
                            y: yPos + dy,
                            color: state.color,
                        });
                    }
                    // update the 'x' position(xPos) after drawing the pixels on a specific row(y axis)
                    xPos += start.x < to.x ? toDraw : -toDraw;
                }
            }
        } else {
            // in case { ratio <= 0.5 }, we need to switch the reference axes to draw the line correctly
            // as well as the ratio's value
            ratio = yDistance / xDistance;
            for (let xCoord = 0; xCoord < xDistance; xCoord++) {
                // 'dx' is positive if the starting point is to the left of 'to' and vice versa
                const dx = start.x < to.x ? xCoord : -xCoord;
                // the number of pixel on each column(on the x axis)
                let pixNum;
                if (rem >= 0.5) {
                    pixNum = ratio - (1 - rem);
                } else {
                    pixNum = ratio + rem;
                }
                rem = getFraction(pixNum);

                const toDraw = Math.round(pixNum);
                if (toDraw === 0) {
                    // if 'toDraw' equals 0, means we have to draw a pixel on the horizontal axis
                    // to do this, it's position should be on the same 'y' coordinate
                    drawn.push({ x: xPos + dx, y: yPos, color: state.color });
                } else {
                    // 'yCoord' is relative to the current position of 'y'(yPos)
                    for (let yCoord = 0; yCoord < toDraw; yCoord++) {
                        // 'dy' is positive if the starting point is above 'to' and vice versa
                        const dy = start.y < to.y ? yCoord : -yCoord;
                        drawn.push({
                            x: xPos + dx,
                            y: yPos + dy,
                            color: state.color,
                        });
                    }
                    // update the yPosition after drawing the pixels on a specific column(x axis)
                    yPos += start.y < to.y ? toDraw : -toDraw;
                }
            }
        }
        dispatch({ picture: state.picture.draw(drawn) });
    }
    drawLine(start);
    return drawLine;
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

function circle(start, state, dispatch) {
    // while dragging the circle is redrawn from the original state
    function drawCircle(to) {
        const radius = Math.sqrt(
            ((start.x - to.x) ** 2) + ((start.y - to.y) ** 2),
        );
        const radiusC = Math.ceil(radius);
        const drawn = [];

        for (let dy = -radiusC; dy <= radiusC; dy++) {
            for (let dx = -radiusC; dx <= radiusC; dx++) {
                // distance to the (dx, dy) point with the origin (0, 0)
                const dist = Math.sqrt((dx ** 2) + (dy ** 2));
                // by drawing the points with the distance smaller than the radius
                // a shape in form of a circle will be created
                if (dist <= radius) {
                    const x = start.x + dx;
                    const y = start.y + dy;
                    if (x >= 0 && x < state.picture.width
                        && y >= 0 && y < state.picture.height) {
                        drawn.push({ x, y, color: state.color });
                    }
                }
            }
        }
        // pass the state a new picture, by drawing a circle on the old image
        dispatch({ picture: state.picture.draw(drawn) });
    }
    drawCircle(start);
    return drawCircle;
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
        this.dom = elt('div', { tabIndex: 0, className: 'pixel-editor' },
            this.canvas.dom,
            elt('br'),
            ...this.controls.reduce((arr, ctrl) => (
                arr.concat(' ', ctrl.dom)
            ), []));
        this.dom.addEventListener('keydown', (event) => {
            if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
                dispatch({ undo: true });
                event.preventDefault();
            }
            for (const toolName of Object.keys(tools)) {
                // if the first letter of a tool was typed
                if (event.key === toolName[0]) {
                    dispatch({ tool: toolName });
                }
            }
        });
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

const startState = {
    tool: 'draw',
    color: '#000000',
    picture: Picture.empty(60, 40, '#f0f0f0'),
    done: [],
    doneAt: 0,
};
const baseTools = {
    draw, line, rectangle, circle, fill, pick,
};
const baseControls = [
    ToolSelect, ColorSelect, SaveButton, LoadButton, UndoButton,
];

function startPixelEditor({
    state = startState,
    tools = baseTools,
    controls = baseControls,
}) {
    const App = new PixelEditor(state, {
        tools,
        controls,
        dispatch(action) {
            state = historyUpdateState(state, action);
            App.syncState(state);
        },
    });
    document.body.appendChild(App.dom);
}

startPixelEditor({});
