/**
 * Gets the '2d' context of a canvas element by id
 * @param {String} id the 'id' of the canvas element
 */
function get2d(id) {
    return document.getElementById(id).getContext('2d');
}

const canv1 = document.getElementById('canv1');
const context1 = canv1.getContext('2d');
context1.fillStyle = 'red';
// creates a rectangle with the top-left edge on the (10px, 10px) coordinates
// and with a width of 100px and height of 100px
context1.fillRect(10, 10, 100, 50);

const cx2 = get2d('canv2');
cx2.strokeStyle = 'blue';
cx2.strokeRect(5, 5, 50, 50);
cx2.lineWidth = 5;
cx2.strokeRect(80, 5, 50, 50);

const cx3 = get2d('canv3');
cx3.beginPath();
for (let y = 10; y <= 100; y += 10) {
    cx3.moveTo(10, y);
    cx3.lineTo(90, y);
}
cx3.stroke();

const cx4 = get2d('canv4');
cx4.beginPath();
cx4.moveTo(50, 10);
cx4.lineTo(10, 70);
cx4.lineTo(90, 70);
cx4.stroke();

// to fill a triangle, 2 sides of it are enough
const cx5 = get2d('canv5');
cx5.beginPath();
cx5.moveTo(50, 10);
cx5.lineTo(10, 70);
cx5.lineTo(90, 70);
cx5.fill();

// Curves
const cx6 = get2d('canv6');
cx6.beginPath();
cx6.moveTo(10, 90);
// a quadratic curve has 1 control point
// control = (60, 10), goal = (90, 90)
cx6.quadraticCurveTo(60, 10, 90, 90);
// line to  the control point
cx6.lineTo(60, 10);
// encloses the path with a line to (10, 90)
// because it first moved there(with moveTo)
cx6.closePath();
cx6.stroke();

const cx7 = get2d('canv7');
cx7.beginPath();
cx7.moveTo(10, 90);
// a bezier curve has 2 control points
// control1 = (10, 10), control2 = (90, 10), goal = (50, 90)
cx7.bezierCurveTo(10, 10, 90, 10, 50, 90);
cx7.lineTo(90, 10);
cx7.lineTo(10, 10);
cx7.closePath();
cx7.stroke();

const cx8 = get2d('canv8');
cx8.beginPath();
// 'arc' draws line along a circle
// the circle is drawn clockwise
// center = (50, 50), radius = 40, startAngle = 0, endAngle = 2π
cx8.arc(50, 50, 40, 0, Math.PI * 2);
// last optional boolean parameter stands for 'anticlockwise'
cx8.arc(150, 50, 40, 0, Math.PI / 2, true);
// the lines drew with arc are connected(to avoid this, start a new path or move to anther point)
cx8.stroke();

// Draw a pie chart
const results = [
    { name: 'Satisfied', count: 1043, color: 'lightblue' },
    { name: 'Neutral', count: 563, color: 'lightgreen' },
    { name: 'Unsatisfied', count: 510, color: 'pink' },
    { name: 'No comment', count: 175, color: 'silver' },
];
const total = results.reduce((sum, { count }) => sum + count, 0);
const anglePerUnit = Math.PI * 2 / total;
const cx9 = get2d('canv9');
let currAngle = 0;
for (const result of results) {
    const angle = anglePerUnit * result.count;

    cx9.fillStyle = result.color;
    cx9.beginPath();
    cx9.moveTo(120, 120);
    cx9.arc(120, 120, 100, currAngle, angle + currAngle);
    cx9.closePath();
    cx9.fill();

    currAngle += angle;
}

// Text
const cx10 = get2d('canv10');
cx10.font = '28px Georgia';
cx10.fillStyle = 'green';
cx10.fillText('I can draw text too!', 10, 50);
cx10.strokeText('Not the prettiest text.', 10, 80);

// Images
const cx11 = get2d('canv11');
const hat = document.createElement('img');
hat.src = 'http://eloquentjavascript.net/img/hat.png';
hat.addEventListener('load', () => {
    for (let x = 10; x < 200; x += 30) {
        cx11.drawImage(hat, x, 10);
    }
});

// animate a sprite on the canvas
const cx12 = get2d('canv12');
const player = document.createElement('img');
player.src = 'http://eloquentjavascript.net/img/player.png';
const spriteW = 24;
const spriteH = 30;
player.addEventListener('load', () => {
    let cycle = 0;
    setInterval(() => {
        cx12.clearRect(0, 0, spriteW, spriteH);
        cx12.drawImage(player,
            // the part of sprite to display
            cycle * spriteW, 0, spriteW, spriteH,
            // the position on the canvas
            0, 0, spriteW, spriteH);
        // use the remainder operator to cycle through the first 8 parts of the sprite
        cycle = (cycle + 1) % 8;
    }, 100);
});

// Transformations
const cx13 = get2d('canv13');
cx13.scale(2, 0.5);
cx13.beginPath();
cx13.arc(50, 50, 40, 0, 2 * Math.PI);
cx13.lineWidth = 3;
cx13.stroke();

function flipHorizontally(context, around) {
    context.translate(around, 0);
    context.scale(-1, 1);
    context.translate(-around, 0);
}

const cx14 = get2d('canv14');
player.addEventListener('load', () => {
    let cycle = 0;
    // flip around the sprite's vertical axis
    flipHorizontally(cx14, spriteW / 2);
    setInterval(() => {
        cx14.clearRect(0, 0, spriteW, spriteH);
        cx14.drawImage(player,
            // the part of sprite to display
            cycle * spriteW, 0, spriteW, spriteH,
            // the position on the canvas
            0, 0, spriteW, spriteH);
        // use the remainder operator to cycle through the first 8 parts of the sprite
        cycle = (cycle + 1) % 8;
    }, 100);
});

const cx15 = get2d('canv15');
function branch(length, angle, scale) {
    cx15.fillRect(0, 0, 1, length);
    if (length < 8) return;
    cx15.save();
    cx15.translate(0, length);
    cx15.rotate(-angle);
    branch(length * scale, angle, scale);
    cx15.rotate(angle * 2);
    branch(length * scale, angle, scale);
    cx15.restore();
}
cx15.translate(150, 0);
branch(40, 0.4, 0.85);

const cx16 = get2d('canv16');
// draws a isosceles trapezoid
function trapezoid(cx, height, smSide, lgSide) {
    const diff = lgSide - smSide;
    if (diff < 0) {
        // eslint-disable-next-line max-len
        throw Error(`Trapezoid base(lgSide: ${lgSide}) should be larger than smSide: ${smSide}`);
    }
    cx.beginPath();
    cx.moveTo(0, height);
    cx.lineTo(lgSide, height);
    cx.lineTo(smSide + diff / 2, 0);
    cx.lineTo(diff / 2, 0);
    cx.closePath();
    cx.stroke();
}
trapezoid(cx16, 50, 60, 160);

const cx17 = get2d('canv17');
// TODO: Draw the examples on canvas
