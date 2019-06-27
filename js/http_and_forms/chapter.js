//
// ──────────────────────────────────────────────────────────────────── I ──────────
//   :::::: H T T P   A N D   F O R M S : :  :   :    :     :        :          :
// ──────────────────────────────────────────────────────────────────────────────
//
console.log('Encode "Yes?":', encodeURIComponent('Yes?'));
console.log('Decode "Yes%3F":', decodeURIComponent('Yes%3F'));

fetch('./example/data.txt').then((response) => {
    console.log(response.status);
    // header names are case insensitive
    console.log(response.headers.get('Content-Type'));
    console.log(response);
});

fetch('./example/data.txt')
    // getting the content of a response may take a while so it returns a response
    .then(response => response.text())
    .then(text => console.log('Response text:', text));

// 'fetch' makes a GET by default,
// to configure the request pass an object with the options as the second argument
fetch('./example/data.txt', { method: 'DELETE' })
    .then((response) => {
        console.log(response.status);
    });

// return only a part of a response(the first 20 characters)
fetch('./example/data.txt', { headers: { Range: 'bytes=0-19' } })
    .then(resp => resp.text())
    .then(text => console.log('First 20 characters:', text));

// currently focused elements
const input = document.getElementById('input');
input.focus();
console.log(document.activeElement.tagName);
// removes focus
input.blur();
console.log(document.activeElement.tagName);

const loginForm = document.getElementById('login-form');
console.log(loginForm.elements);
// Form.elements acts as an array-like object and a map,
// being able to access it's values through the 'name' property
console.log(loginForm.elements[1]);
console.log(loginForm.elements.name.type);
// each element of a form has a 'form' method which returns the containing form
console.log(loginForm.elements.password.form === loginForm);

const preventForm = document.getElementById('prevent-form');
preventForm.addEventListener('submit', (event) => {
    console.log('Saving value:', preventForm.elements.value.value);
    preventForm.elements.value.value = '';
    event.preventDefault();
});

const article = document.getElementById('article');
function replaceSelection(field, word) {
    const from = field.selectionStart;
    const to = field.selectionEnd;
    field.value = field.value.slice(0, from) + word + field.value.slice(to);
    // put the cursor after the word
    field.selectionStart = from + word.length;
    field.selectionEnd = from + word.length;
}
article.addEventListener('keydown', (event) => {
    // if F2 is pressed, insert the name 'Khasekhemwy'
    if (event.keyCode === 113) {
        replaceSelection(article, 'Khasekhemwy');
        event.preventDefault();
    }
});

const countedArea = document.getElementById('counted-area');
const counter = document.getElementById('counter');
countedArea.addEventListener('input', () => {
    counter.innerText = countedArea.value.length;
});

const checkboxPurple = document.getElementById('purple');
checkboxPurple.addEventListener('change', () => {
    document.body.style.background = checkboxPurple.checked ? 'mediumpurple' : '';
});

// all elements with the 'name' attribute equal to 'color'
const colorRadios = document.querySelectorAll('[name=color]');
for (const button of colorRadios) {
    button.addEventListener('change', () => {
        document.body.style.background = button.value;
    });
}

const binarySelect = document.getElementById('binary-select');
const output = document.getElementById('output');
binarySelect.addEventListener('change', () => {
    let number = 0;
    for (const option of Array.from(binarySelect.options)) {
        if (option.selected) {
            number += Number(option.value);
        }
    }
    output.textContent = number;
});

const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        console.log(`You chose: ${file.name}`);
        if (file.type) console.log(`It's type is ${file.type}`);
        console.log(file);
    }
});

const filesInput = document.getElementById('files-input');
filesInput.addEventListener('change', () => {
    for (const file of Array.from(filesInput.files)) {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.addEventListener('load', () => {
            console.log(`File ${file.name}:\n`, reader.result);
        });
    }
});

// promise based interface for FileReader
// the 'format' is passed to 'readAs{format}' method to invoke the wanted read function
function readFile(file, format) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        // read the file as the given format
        reader[`readAs${format}`](file);
        reader.addEventListener('load', () => resolve(reader.result));
        reader.addEventListener('error', () => reject(reader.error));
    });
}

const aFilesInput = document.getElementById('async-files-input');
aFilesInput.addEventListener('change', async () => {
    for (const file of Array.from(aFilesInput.files)) {
        readFile(file, 'Text')
            .then(fileContent => (
                console.log(`File ${file.name}\n`, fileContent)
            ), error => console.log(error));
    }
});

// Simple note taking app
const noteList = document.getElementById('note-names');
const noteField = document.getElementById('note');
const addBtn = document.getElementById('add-note');
let state;

function setState(newState) {
    // clear the select field's options
    noteList.textContent = '';
    for (const name of Object.keys(newState.notes)) {
        const option = document.createElement('option');
        option.textContent = name;
        if (newState.selected === name) option.selected = true;
        noteList.appendChild(option);
    }
    noteField.value = newState.notes[newState.selected];

    localStorage.setItem('Notes', JSON.stringify(newState));
    state = newState;
}

// display the selected note from the list
noteList.addEventListener('change', () => (
    setState({ notes: state.notes, selected: noteList.value })
));
// update a note on change
noteField.addEventListener('change', () => (
    setState({
        // copy the state's notes and the 3rd argument to and empty object
        notes: Object.assign({},
            state.notes,
            { [state.selected]: noteField.value }),
        selected: state.selected,
    })
));
// add a new note
addBtn.addEventListener('click', () => {
    // eslint-disable-next-line no-alert
    const name = prompt('Note name:');
    if (name) {
        setState({
            notes: Object.assign({},
                state.notes,
                { [name]: '' }),
            selected: name,
        });
    }
});

setState(JSON.parse(localStorage.getItem('Notes'))
    || { notes: { Note: '' }, selected: 'Note' });


const code = document.getElementById('code');
const runBtn = document.getElementById('run-btn');
runBtn.addEventListener('click', () => {
    let codeOutput;
    try {
        // eslint-disable-next-line no-new-func
        const returnVal = Function('', code.value);
        codeOutput = returnVal();
    } catch (err) {
        codeOutput = err;
    } finally {
        const parag = document.createElement('p');
        parag.textContent = codeOutput.toString();
        code.parentNode.insertBefore(parag, runBtn.nextSibling);
    }
});
