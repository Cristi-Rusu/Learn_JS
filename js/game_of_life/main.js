//
// ──────────────────────────────────────────────────────────────── I ──────────
//   :::::: G A M E   O F   L I V E : :  :   :    :     :        :          :
// ──────────────────────────────────────────────────────────────────────────
//

function elt(name, attrs, ...children) {
    const dom = document.createElement(name);
    for (const attr of Object.keys(attrs)) {
        dom.setAttribute(attr, attrs[attr]);
    }
    for (const child of children) {
        dom.append(child);
    }
    return dom;
}

class Cell {
    constructor(y, x) {
        this.y = y;
        this.x = x;
        this.checkbox = elt('input', { type: 'checkbox' });
    }

    get alive() {
        return this.checkbox.checked;
    }

    set alive(bool) {
        this.checkbox.checked = bool;
    }
}

function getNeighbors(matrix, y, x) {
    const neighbors = [];
    const matrixHeight = matrix.length;
    const matrixWidth = matrix[0].length;
    // tells if 'num' is contained in (0, ..., range - 1)
    const isInside = (num, range) => num >= 0 && num < range;
    // check if it's a not the element we are looking the neighbors for
    const isNeighbor = (yPos, xPos) => !(yPos === y && xPos === x);
    for (let i = y - 1; i <= y + 1; i++) {
        if (isInside(i, matrixHeight)) {
            for (let j = x - 1; j <= x + 1; j++) {
                if (isInside(j, matrixWidth)) {
                    if (isNeighbor(i, j)) {
                        neighbors.push(matrix[i][j]);
                    }
                }
            }
        }
    }
    return neighbors;
}

class Grid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.cells = [];

        for (let y = 0; y < this.height; y++) {
            const row = [];
            for (let x = 0; x < this.width; x++) {
                const cell = new Cell(y, x);
                row.push(cell);
            }
            this.cells.push(row);
        }
    }

    static random(width, height) {
        const random = new Grid(width, height);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                random.cells[y][x].alive = Math.random() > 0.5;
            }
        }
        return random;
    }
}

class Game {
    constructor(grid) {
        this.grid = grid;
        this.board = elt('div', { class: 'board' });
        this.nextBtn = elt('button', {}, 'Next Generation');
        this.autoBtn = elt('button', {}, 'Auto Run');
        this.dom = elt('div', { class: 'game' },
            this.board,
            this.nextBtn,
            this.autoBtn);

        const { cells } = this.grid;
        for (let y = 0; y < this.grid.height; y++) {
            for (let x = 0; x < this.grid.width; x++) {
                this.board.appendChild(cells[y][x].checkbox);
            }
            // break the line each row
            this.board.appendChild(elt('br', {}));
        }

        this.nextBtn.addEventListener('click', () => {
            this.nextGeneration();
        });
        let running;
        this.autoBtn.addEventListener('click', () => {
            if (!running) {
                this.nextGeneration();
                running = setInterval(() => {
                    this.nextGeneration();
                }, 200);
            } else {
                clearInterval(running);
                running = null;
            }
        });
    }

    get state() {
        return this.grid.cells.map(row => (
            row.map(cell => cell.alive)
        ));
    }

    nextGeneration() {
        const { cells, height, width } = this.grid;
        const oldState = this.state;
        const newState = this.state;

        for (let y = 0; y < height; y++) {
            newState.push([]);
            for (let x = 0; x < width; x++) {
                const neighbors = getNeighbors(oldState, y, x);
                // count the alive neighbors
                const aliveNeighbors = neighbors.reduce((total, alive) => (
                    total + (alive ? 1 : 0)
                ), 0);

                // if there are 3 alive neighbors
                // or the cell is alive and has 2 alive neighbors
                if (aliveNeighbors === 3
                    || (oldState[y][x] && aliveNeighbors === 2)) {
                    newState[y][x] = true;
                } else {
                    newState[y][x] = false;
                }
                // change only the updated cells
                if (oldState[y][x] !== newState[y][x]) {
                    cells[y][x].alive = newState[y][x];
                }
            }
        }
    }
}

const game = new Game(Grid.random(40, 30));
document.body.appendChild(game.dom);
