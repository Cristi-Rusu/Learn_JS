/* eslint-disable prefer-promise-reject-errors */

/* Asynchronous Programming */

import {
    bigOak, defineRequestType, everywhere, NetWork,
} from './crow-tech.js';

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


class Timeout extends Error {}

function request(nest, target, type, content) {
    return new Promise((resolve, reject) => {
        let done = false;
        function attempt(n) {
            // send the request
            // the last argument is the function to be executed after the response was received
            nest.send(target, type, content, (failed, value) => {
                done = true;
                if (failed) reject(failed);
                else resolve(value);
            });
            // if the request wasn't done in 250ms, retry or reject it
            // if it was, return it's status(resolved or rejected promise)
            setTimeout(() => {
                if (done) return;
                if (n < 3) attempt(n + 1);
                else reject(new Timeout('Timed out'));
            }, 250);
        }
        attempt(1);
    });
}

// a promise based interface for defining new types
function requestType(name, handler) {
    defineRequestType(name, (nest, content, source, callback) => {
        try {
            Promise.resolve(handler(nest, content, source))
                // if the promise is resolved, assign the response to the callback
                // the first value holds an error(if any)
                .then(response => callback(null, response),
                    // if failed, 'report' the error to the callback
                    failed => callback(failed));
        } catch (err) {
            // any other exceptions are also registered
            callback(err);
        }
    });
}

requestType('ping', () => 'pong');

async function availableNeighbors(nest) {
    const requests = nest.neighbors.map(neighbor => (
        request(nest, neighbor, 'ping').then(() => true, () => false)
    ));
    const result = await Promise.all(requests);
    return nest.neighbors.filter((_, i) => result[i]);
}

console.log(availableNeighbors(bigOak));

// Network flooding
// floods a network with an information until all nodes have it

everywhere((nest) => {
    nest.state.gossip = [];
});

function sendGossip(nest, message, exceptFor = null) {
    nest.state.gossip.push(message);
    for (const neighbor of nest.neighbors) {
        if (neighbor !== exceptFor) {
            request(nest, neighbor, 'gossip', message);
        }
    }
}

requestType('gossip', (nest, message, source) => {
    if (nest.state.gossip.includes(message)) return;
    console.log(`${nest.name} received gossip '${message}' from ${source}.`);
    sendGossip(nest, message, source);
});

// sendGossip(bigOak, 'Kids with airgun in the park.');

async function broadcastConnections(nest, name, exceptFor = null) {
    const requests = nest.neighbors.map((neighbor) => {
        if (neighbor !== exceptFor) {
            return request(nest, neighbor, 'connections', {
                name,
                neighbors: nest.state.connections.get(name),
            }).then(() => `Sent connections from ${nest.name} to ${neighbor}.`,
                () => `Failed to send data from ${nest.name} to ${neighbor}.`);
        }
    });
    return Promise.all(requests);
}

async function updateConnections() {
    const requests = Object.values(NetWork.nodes).map((nest) => {
        nest.state.connections = new Map();
        nest.state.connections.set(nest.name, nest.neighbors);
        return broadcastConnections(nest, nest.name);
    });
    const result = await Promise.all(requests);
    return result;
}

requestType('connections', (nest, { name, neighbors }, source) => {
    const { connections } = nest.state;
    // if the current nest has the connections from the received message({ name, neighbors })
    // JSON.stringify was used to be able to evaluate 2 arrays
    if (JSON.stringify(connections.get(name)) === JSON.stringify(neighbors)) {
        return;
    }
    // if it doesn't have the connections from the received message,
    // add them to the nest's 'connections' Map
    connections.set(name, neighbors);
    // send the received information to the adjacent nest's, except from the source
    broadcastConnections(nest, name, source);
});

// returns the next step in the wanted direction('to')
// given the current place and connections
function findRoute(from, to, connections) {
    const routes = [{ at: from, via: null }];
    for (let i = 0; i < routes.length; i++) {
        const { at, via } = routes[i];
        for (const next of connections.get(at) || []) {
            if (next === to) return via;
            // if the current position('next') is not in the routes array,
            // add it, so that it will be checked for the destination too
            if (!routes.some(r => r.at === next)) {
                routes.push({ at: next, via: via || next });
            }
        }
    }
    return null;
}

function routeRequest(nest, target, type, content) {
    if (nest.neighbors.includes(target)) {
        return request(nest, target, type, content);
    }
    const via = findRoute(nest.name, target, nest.state.connections);
    if (!via) throw new Error(`No route to ${target}`);
    return request(nest, via, 'route', { target, type, content });
}

async function routeReqUpdate(nest, target, type, content) {
    await updateConnections();
    routeRequest(nest, target, type, content);
}

requestType('route', (nest, { target, type, content }) => (
    // makes the call to 'request' with the (type = 'route') recursive
    // and sends the request node by note to the 'target'
    routeRequest(nest, target, type, content)
));

// this function call depends on the updateConnection()
// it first awaits for it to finish and then executes
// it is very BUGGY now
// routeReqUpdate(bigOak, 'Church Tower', 'note', 'Incoming jackdaws!');

requestType('storage', (nest, name) => storage(nest, name));

function network(nest) {
    return Array.from(nest.state.connections.keys());
}

function findInRemoteStorage(nest, name) {
    let sources = network(nest).filter(n => n !== nest.name);
    function next() {
        if (sources.length === 0) {
            return Promise.reject(new Error('Not found'));
        }
        const source = sources[Math.floor(Math.random() * sources.length)];
        sources = sources.filter(s => s !== source);
        return routeRequest(nest, source, 'storage', name)
            .then(value => (value != null ? value : next()), next);
    }
    return next();
}

function findInStorage(nest, name) {
    return storage(nest, name).then((found) => {
        if (found != null) return found;
        return findInRemoteStorage(nest, name);
    });
}
// async version of 'findInStorage'
async function findInStorageA(nest, name) {
    const local = await storage(nest, name);
    if (local != null) return local;

    let sources = network(nest).filter(n => n !== nest.name);
    while (sources.length > 0) {
        const source = sources[Math.floor(Math.random() * sources.length)];
        sources = sources.filter(s => s !== source);
        try {
            // eslint-disable-next-line no-await-in-loop
            const found = await routeRequest(nest, source, 'storage', name);
            if (found != null) return found;
        } catch (e) {
            console.error(e);
        }
    }
    throw new Error('Not found.');
}

// Generators
// when generators are called they return an iterator
function* powers(n) {
    for (let current = n; ; current *= n) {
        yield current;
    }
}

for (const power of powers(3)) {
    if (power > 100) break;
    console.log(power);
}

// Event Loop

try {
    setTimeout(() => {
        throw new Error('Woosh');
    });
} catch (e) {
    // This will not run, because the program first catches errors(if any)
    // and after the timeout is done, executes the code inside it
    console.log('Caught!');
}
// the console.log is added to the callback que
// that's why it doesn't log right away
Promise.resolve('Done.').then(console.log);
console.log('Me first!');

// Asynchronous bugs
//
function anyStorage(nest, source, name) {
    if (source === nest.name) return storage(nest, name);
    return routeRequest(nest, source, 'storage', name);
}
// returns the line of the request that took the longer to execute
// expected to return the list of all the nests in the network
// 'B' stands for BUGGY
async function chicksB(nest, year) {
    let list = '';
    await Promise.all(network(nest).map(async (name) => {
        list += `${name}: ${
            await anyStorage(nest, name, `chicks in ${year}`)
        }\n`;
    }));
    return list;
}

async function chicks(nest, year) {
    const lines = network(nest).map(async name => (
        `${name}: ${
            await anyStorage(nest, name, `chicks in ${year}`)
        }`
    ));
    return (await Promise.all(lines)).join('\n');
}

// async function to locate the scalpel from any nest
async function locateScalpel(nest) {
    let location = await anyStorage(nest, nest.name, 'scalpel');
    while (nest.name !== location) {
        // gets the nest by it's name
        nest = NetWork.nodes[location];
        // eslint-disable-next-line no-await-in-loop
        location = await anyStorage(nest, nest.name, 'scalpel');
    }
    return location;
}
// 'locateScalpel' version without async/await syntax
function locateScalpel2(nest) {
    return anyStorage(nest, nest.name, 'scalpel').then((location) => {
        if (nest.name === location) {
            return location;
        }
        // 'NetWork.nodes[location]' gets the nest by it's name
        return locateScalpel2(NetWork.nodes[location]);
    });
}

// create global variables to be able to access it in the browser's console
// it is done for debugging purposes
// leaving imported/module variables in the global scope is a bad practice
window.bigOak = bigOak;
window.NetWork = NetWork;
window.availableNeighbors = availableNeighbors;
window.everywhere = everywhere;
window.sendGossip = sendGossip;
window.broadcastConnections = broadcastConnections;
window.updateConnections = updateConnections;
window.findRoute = findRoute;
window.routeRequest = routeRequest;
window.routeReqUpdate = routeReqUpdate;
window.findInStorage = findInStorage;
window.findInStorageA = findInStorageA;
window.requestType = requestType;
window.storage = storage;
window.request = request;
window.chicksB = chicksB;
window.chicks = chicks;
window.anyStorage = anyStorage;
window.locateScalpel = locateScalpel;
window.locateScalpel2 = locateScalpel2;
window.soon = soon;
