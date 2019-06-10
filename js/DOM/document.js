//
// ────────────────────────────────────────────────────── I ──────────
//   :::::: T H E   D O M : :  :   :    :     :        :          :
// ────────────────────────────────────────────────────────────────
//

// a recursive function to search for a string in text nodes
function contains(node, string) {
    if (node.nodeType === Node.ELEMENT_NODE) {
        for (let i = 0; i < node.childNodes.length; i++) {
            if (contains(node.childNodes[i], string)) {
                return true;
            }
        }
    } else if (node.nodeType === Node.TEXT_NODE) {
        return node.nodeValue.indexOf(string) !== -1;
    }
    return false;
}

console.log('This document contains the word "JS":',
    contains(document.documentElement, 'JS'));

document.getElementById('parags').innerHTML = `
    <p>First paragraph</p>
    <p>Second paragraph</p>
    <p>Third paragraph</p>
`;

const parag4 = document.createElement('p');
parag4.innerHTML = 'Fourth paragraph';
document.getElementById('parags').appendChild(parag4);

const parags = document.getElementsByTagName('p');

document.getElementById('parags').insertBefore(parags[2], parags[0]);

// replace images with their alt attributes
function replaceImg() {
    const images = document.getElementsByTagName('img');
    for (let i = images.length - 1; i >= 0; i--) {
        const image = images[i];
        if (image.alt) {
            const textNode = document.createTextNode(image.alt);
            image.parentNode.replaceChild(textNode, image);
        }
    }
}
const replaceBtn = document.getElementById('replace');
replaceBtn.onclick = replaceImg;

// create array from nodeList
const paragArray = Array.from(parags);
console.log(paragArray.map(p => p.textContent));

// create a node, given it's type and children
function elt(type, ...children) {
    const node = document.createElement(type);
    for (const child of children) {
        if (typeof child !== 'string') node.appendChild(child);
        else node.appendChild(document.createTextNode(child));
    }
    return node;
}
document.getElementById('quote').appendChild(
    elt('footer', '-',
        elt('strong', 'Karl Popper'),
        ', preface to the second edition of ',
        elt('em', 'The Open Society and It\'s Enemies'),
        ', 1950'),
);
// access custom attributes
for (const parag of paragArray) {
    if (parag.getAttribute('data-classified') === 'secret') {
        // need to create a new variable because once a node is removed,
        // it destroys it's binging too
        const removed = parag.outerHTML;
        console.log('removed:', removed);
        parag.remove();
    }
}
// demonstrate offsetHeight and clientHeight difference
const styleParag = document.createElement('p');
styleParag.innerHTML = "I'm boxed in";
styleParag.style.border = '3px solid red';
document.body.appendChild(styleParag);
console.log('offsetHeight:', styleParag.offsetHeight, '- with border');
console.log('clientHeight:', styleParag.clientHeight, '- without border');
console.log('Red parag position:', styleParag.getBoundingClientRect());

// computing and reading the DOM in parallel is very slow
function timeFun(name, action) {
    const start = Date.now();
    action();
    console.log(`${name} took ${Date.now() - start} ms`);
}
// both functions draw a line of 'X' 2000px wide
timeFun('naive', () => {
    const node = document.getElementById('one');
    while (node.offsetWidth < 2000) {
        node.appendChild(document.createTextNode('X'));
    }
});
timeFun('clever', () => {
    const node = document.getElementById('two');
    node.appendChild(document.createTextNode('XXXXX'));
    // find out how many 'X' are needed to make a 2000px wide line
    const target = Math.ceil(2000 / (node.offsetWidth / 5));
    node.innerHTML = 'X'.repeat(target);
});

// Write an animation
const cat = document.getElementById('drunk-cat');
let angle = Math.PI / 2;
function animate(time, lastTime) {
    if (lastTime != null) {
        // handle the speed of the animation
        angle += (time - lastTime) * 0.0015;
    }
    // change the position of the cat on each frame refresh
    // describe an ellipse
    cat.style.top = `${Math.sin(angle) * 20}px`;
    cat.style.left = `${Math.cos(angle) * 200}px`;
    // the next animation frame will take the current time as the 'lastTime'
    requestAnimationFrame(newTime => animate(newTime, time));
}
// notice how the first second the animation is jittery because of the JS execution
// the frames are refreshed when no JS is being executed
requestAnimationFrame(animate);

const mountains = [
    { name: 'Kilimanjaro', height: 5895, place: 'Tanzania' },
    { name: 'Everest', height: 8848, place: 'Nepal' },
    { name: 'Mount Fuji', height: 3776, place: 'Japan' },
    { name: 'Vaalserberg', height: 323, place: 'Netherlands' },
    { name: 'Denali', height: 6168, place: 'United States' },
    { name: 'Popocatepetl', height: 5465, place: 'Mexico' },
    { name: 'Mont Blanc', height: 4808, place: 'Italy/France' },
];

// create a table given an array of objects
function createTable(tableArray) {
    // check the structure of the table array
    // compare each object from the array with the next one
    for (let i = 0; i < tableArray.length - 1; i++) {
        const currentObjKeys = Object.keys(tableArray[i]);
        const nextObjKeys = Object.keys(tableArray[i + 1]);
        if (currentObjKeys.length !== nextObjKeys.length) {
            throw new Error('Table elements should have the same column length');
        }
        for (let j = 0; j < currentObjKeys.length; j++) {
            if (currentObjKeys[j] !== nextObjKeys[j]) {
                throw new Error('Table elements should have the same property name');
            }
        }
    }
    // create the table
    const table = document.createElement('table');
    // create header(they are the same for every obj in the array)
    const headings = Object.keys(tableArray[0]);
    const headRow = document.createElement('tr');
    for (const heading of headings) {
        const th = document.createElement('th');
        th.innerHTML = heading;
        headRow.appendChild(th);
    }
    table.appendChild(headRow);
    // create the rows
    for (let i = 0; i < tableArray.length; i++) {
        const tr = document.createElement('tr');
        const rowData = Object.values(tableArray[i]);
        // create the columns
        for (let j = 0; j < rowData.length; j++) {
            const td = document.createElement('td');
            if (typeof rowData[j] === 'number') {
                td.style.textAlign = 'right';
            }
            td.innerHTML = rowData[j];
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    return table;
}
const mountainTable = createTable(mountains);
document.getElementById('mountains').appendChild(mountainTable);

// recursive function to find elements by tag name, given a parent node
function byTagName(node, tagName) {
    const array = [];
    tagName = tagName.toUpperCase();
    function explore(elem) {
        for (let i = 0; i < elem.children.length; i++) {
            const child = elem.children[i];
            if (child.tagName === tagName) array.push(child);
            if (child.children.length !== 0) explore(child);
        }
    }
    explore(node);
    return array;
}
console.log(byTagName(document.body, 'td'));

// animate the cat and hat
const wizCat = document.getElementById('wizard-cat');
const wizHat = document.getElementById('cats-hat');
let ang = Math.PI / 2;
function animateWiz(time, lastTime) {
    if (lastTime != null) {
        // handle the speed of the animation
        ang += (time - lastTime) * 0.0015;
    }
    // change the position of the cat on each frame refresh
    // describe an ellipse
    wizCat.style.top = `${-Math.sin(ang) * 40}px`;
    wizCat.style.left = `${-Math.cos(ang) * 200}px`;
    wizHat.style.top = `${(-Math.sin(ang) * 40 - 40) + Math.cos(ang) * 75}px`;
    wizHat.style.left = `${(-Math.cos(ang) * 200 - 75) + Math.sin(ang) * 75}px`;
    // the next animation frame will take the current time as the 'lastTime'
    requestAnimationFrame(newTime => animateWiz(newTime, time));
}
// notice how the first second the animation is jittery because of the JS execution
// the frames are refreshed when no JS is being executed
requestAnimationFrame(animateWiz);
