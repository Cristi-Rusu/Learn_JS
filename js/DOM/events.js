//
// ────────────────────────────────────────────────────────────────────── I ──────────
//   :::::: H A N D L I N G   E V E N T S : :  :   :    :     :        :          :
// ────────────────────────────────────────────────────────────────────────────────
//

const btnMousedown = document.getElementById('btn-mousedown');
// the argument passed to the callback function is the event listener object
btnMousedown.addEventListener('mousedown', (event) => {
    if (event.button === 0) {
        console.log('Left button', event);
    } else if (event.button === 0) {
        console.log('Middle button', event);
    } else if (event.button === 2) {
        console.log('Right button', event);
    }
});

const paragClick = document.getElementById('parag-click');
const btnClick = document.getElementById('btn-click');
paragClick.addEventListener('click', () => {
    console.log('Parag click event handler');
});
btnClick.addEventListener('click', (event) => {
    // the event object also stores the node acted upon
    console.log('Btn click event handler', event.target);
    event.stopPropagation();
});

// you can monitor key combinations with
// 'altKey', 'ctrlKey', 'shiftKey' and 'metaKey'(command on Mac)
window.addEventListener('keydown', (event) => {
    if (event.key === ' ' && event.shiftKey) {
        event.preventDefault();
        console.log('Continuing!');
    }
});

// get the position of the click
const dotTable = document.getElementById('dot-table');
dotTable.addEventListener('click', (event) => {
    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.style.left = `${event.pageX - 4}px`;
    dot.style.top = `${event.pageY - 4}px`;
    dotTable.appendChild(dot);
});

// make the bar resizable by dragging it
// it doesn't work on touchscreens currently
const bar = document.getElementById('bar');
let lastX;
function move(event) {
    if (event.buttons === 0) {
        window.removeEventListener('mousemove', move);
    } else {
        // moved distance
        const dist = event.pageX - lastX;
        const newWidth = bar.offsetWidth + dist;
        bar.style.width = `${newWidth}px`;
        lastX = event.pageX;
    }
}
bar.addEventListener('mousedown', (event) => {
    lastX = event.pageX;
    window.addEventListener('mousemove', move);
    event.preventDefault(); // prevent selection
});

function tapCircle(event) {
    const circles = document.getElementsByClassName('circle');
    for (const circle of Array.from(circles)) {
        circle.remove();
    }
    for (let i = 0; i < event.touches.length; i++) {
        const { pageX, pageY } = event.touches[i];
        const circle = document.createElement('div');
        circle.className('circle');
        circle.style.left = `${pageX - 50}px`;
        circle.style.top = `${pageY - 50}px`;
        document.body.appendChild(circle);
    }
}
window.addEventListener('touchstart', tapCircle);
window.addEventListener('touchmove', tapCircle);
window.addEventListener('touchend', tapCircle);

// make a progress bar depending on the the scrollHeight
const progBar = document.getElementById('progress-bar');
const scrollText = document.getElementById('scroll-text');
const scrollTextHeight = scrollText.scrollHeight - scrollText.clientHeight;
scrollText.addEventListener('scroll', () => {
    const currentHeight = scrollText.scrollTop;
    progBar.style.width = `${(currentHeight / scrollTextHeight) * 100}%`;
});

const help = document.getElementById('help');
const fields = document.getElementsByTagName('input');
for (const field of Array.from(fields)) {
    field.addEventListener('focus', () => {
        const text = field.getAttribute('data-help');
        help.textContent = text;
    });
    field.addEventListener('blur', () => {
        help.textContent = '';
    });
}

// communicate with a service worker
// it is done asynchronously
const squareWorker = new Worker('squareWorker.js');
squareWorker.addEventListener('message', (event) => {
    console.log(`Service worker responded with: ${event.data}`, event);
});
squareWorker.postMessage(10);
squareWorker.postMessage(24);

// Timers
const bombTimer = setTimeout(() => {
    console.log('BOOM!');
}, 500);
if (Math.random() < 0.5) {
    clearTimeout(bombTimer);
    console.log('Defused.');
}

let ticks = 0;
const clock = setInterval(() => {
    ticks += 1;
    console.log('tick', ticks);
    if (ticks === 10) {
        clearInterval(clock);
        console.log('stop.');
    }
}, 200);

// debouncing events(firing them after a period of time, not immediately)
const textarea = document.querySelector('textarea');
let timeout = null;
textarea.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => console.log('Typed!'), 500);
});

let scheduled = null;
const mousePoz = document.getElementById('mouse-poz');
window.addEventListener('mousemove', (event) => {
    if (!scheduled) {
        setTimeout(() => {
            mousePoz.textContent = `Mouse at
                ${scheduled.pageX}, ${scheduled.pageY}`;
            scheduled = null;
        }, 250);
    }
    scheduled = event;
});
