/* eslint-disable no-restricted-globals */

// after receiving a message, it sends back another message
// with the computed value
// service workers run on their own timeline and do not share their own global scope
// this allows for having multiple threads(sort of), with messages being sent back and forth
addEventListener('message', (event) => {
    postMessage(event.data * event.data);
});
