import { bigOak, defineRequestType } from './crow-tech.js';

// create a global variable to be able to access it in the browser's console
// it is done for debugging purposes
// leaving imported variables in the global scope is a bad practice
window.bigOak = bigOak;

bigOak.readStorage('food caches', (caches) => {
    const firstCache = caches[0];
    bigOak.readStorage(firstCache, (info) => {
        console.log(info);
    });
});
// to be able to receive a request it has to be defined
// the second argument is the request handler
defineRequestType('note', (nest, content, source, done) => {
    console.log(`${nest.name} received note: ${content}`);
    done();
});
// the last argument is a function that is called when a response comes
bigOak.send('Cow Pasture', 'note', "Let's caw loudly at 7PM", () => {
    console.log('Note delivered.');
});

// Promises
const fifteen = Promise.resolve(15);
fifteen.then(val => console.log(`Got ${val}`),
    val => console.log(`Didn't get ${val}`));
fifteen.then(val => console.log(`Get ${val} again`));
// 'then' method takes as the second argument, a function to be executed
// when the promise is rejected
const data = Promise.reject('data');
data.then(val => console.log(`Got ${val}`),
    val => console.log(`Didn't get ${val}`));

// a promise based representation of the 'readStorage' function
function storage(nest, name) {
    return new Promise((resolve) => {
        nest.readStorage(name, result => resolve(result));
    });
}
// it returns a promise, so that a specific code can be run after
// it is resolved(or rejected)
storage(bigOak, 'enemies').then(val => console.log('Got', val));

const failure = new Promise((_, reject) => reject(new Error('Fail')));
// because the promise is rejected and this 'then' call doesn't have
// a second function to handle rejections, nothing will happen
failure.then(val => console.log('Handler 1', val))
    // the 'catch' method receives the reason(exception), and outputs it
    // it then returns a not promise value, which creates a resolved promise with that value
    .catch((reason) => {
        console.log(`Caught failure ${reason}`);
        return 'nothing';
    })
    // because the promise is resolved now, the second handler can be executed
    .then(val => console.log('Handler 2', val));
