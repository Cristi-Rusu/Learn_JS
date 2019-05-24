/* Delivery Automaton */

// The village's graph will be formed from this array
// the '-' symbol indicates the direction
// it will be used to tell what places can be reached from a given point, by spliting the item on the '-' symbol
// a road should have the form 'Start-End'
const roads = [
    "Alice's House-Bob's House",   "Alice's House-Cabin",
    "Alice's House-Post Office",   "Bob's House-Town Hall",
    "Daria's House-Ernie's House", "Daria's House-Town Hall",
    "Ernie's House-Grete's House", "Grete's House-Farm",
    "Grete's House-Shop",          "Marketplace-Farm",
    "Marketplace-Post Office",     "Marketplace-Shop",
    "Marketplace-Town Hall",       "Shop-Town Hall"
];

// this is a route which connects all the places
const mailRoute = [
    "Alice's House", "Cabin", "Alice's House", "Bob's House",
    "Town Hall", "Daria's House", "Ernie's House",
    "Grete's House", "Shop", "Grete's House", "Farm",
    "Marketplace", "Post Office"
];

function builGraph( edges ) {
    // create an empty object( whith no prototype )
    let graph = Object.create(null);
    function addEdge( from, to ) {
        if ( graph[from] === undefined ) {
            graph[from] = [to];
        } else {
            graph[from].push(to);
        }
    }
    // split the road values to get the places connected by them
    // 'edges' will now be an array of arrays containing the 'from' and 'to' location
    edges = edges.map(edge => edge.split("-"));
    // add all the possible routes from the 'edges' given 
    for ( let [from, to] of edges ) {
        addEdge(from, to);
        addEdge(to, from);
    }
    return graph;
}
let roadGraph = builGraph( roads );
// console.log(roadGraph);

/**
 * pick a random item from the array or a key of an object
 * @param {array || object} object the colection from which a random item will be picked
 */
function randomPick( object ) {
    const randNum = limit => Math.floor( Math.random() * limit );
    // if it's an array, choose from it's items
    if ( Array.isArray(object) ) {
        let randIndex = randNum(object.length);
        return object[randIndex];
    // else, choose from it's keys
    } else {
        let keys = Object.keys(object);
        let randIndex = randNum(keys.length);
        return keys[randIndex];
    }
}

class VillageState {
    constructor( place, parcels ) {
        this.place = place;
        this.parcels = parcels;
    }

    move( destination ) {
        // if the destination is not connected to this place, the move is not valid and it doesn't move
        if ( !roadGraph[this.place].includes( destination ) ) {
            return this;
        } else {
            // update the position of parcels
            let parcels = this.parcels.map(p => {
                // if the parcel is not on the robot's place, don't update it
                if ( p.place !== this.place ) return p;
                // otherwise, change it's place to 'destination'
                return {place: destination, address: p.address};
            // exclude the delivered parcels after the move("make the delivery")
            }).filter(p => p.place !== p.address );
            // update the state of the village with the new parameters
            return new VillageState( destination, parcels );
        }
    }
    // generates a random state of the village
    static random( parcelNum = 5 ) {
        let parcels = [];
        for ( let i = 0; i < parcelNum; i++ ) {
            let address = randomPick(roadGraph);
            let place;
            // update the 'place' while it's equal to 'address'
            do {
                place = randomPick(roadGraph);
            } while ( place === address );
            // push the parcel information to the 'parcels' array
            parcels.push( {place, address} );
        }
        return new VillageState("Post Office", parcels);
    }
}


/**
 * this robot picks a random direction from the current place which is 'state.place'
 * it's a dumb robot, so it doesn't have memory
 * @param {instanceof VillageState} state it stores the information about the robot's and parcels' location
 */
function randomRobot( state ) {
    return {
        direction: randomPick(roadGraph[state.place])
    };
}

/**
 * It moves based on the 'mailRoute' and repeates the route if needed
 * @param {instanceof VillageState} state it stores the information about the robot's and parcels' location 
 * @param {Array} memory It stores the route the robot has to follow
 */
function mailRobot( state, memory ) {
    if ( memory.length === 0 ) {
        memory = mailRoute;
    }
    // make the first move from the memory, and update it
    return {
        direction: memory[0],
        memory: memory.slice(1)
    };
}

/**
 * finds one of the shortest paths to a destination, given the starting point and the graph
 * @param {object} graph the graph from which the paths will be found
 * @param {string} from the name of the starting point(it is a key from the graph object)
 * @param {string} to the name of the goal point(it is a key from the graph object)
 */
function findPath( graph, from, to ) {
    // this array stores all the posible paths until at least one matching is found and returned
    let paths = [{at: from, path: []}];

    for ( let i = 0; i < paths.length; i++ ) {
        let {at, path} = paths[i];
        // iterate through the connected points of the current position - "at" to find the destination
        for ( let place of graph[at] ) {
            if ( place === to ) return path.concat(place);
            // if this place is not in the 'paths' array, add it for further exploration
            if ( !paths.some(p => p.at === place) ) {
                paths.push({at: place, path: path.concat(place)});
            }
        }
    }
}

/**
 * A robot which finds the path to parcels and their addresses. It chooses the parcels in consecutive order.
 * A more optimized version which chooses from the closest ones will be built.
 * @param {instanceof VillageState} param0 use the destructuring syntax to access the properties more easily
 * @param {Array} route similar to the other robot's memory, but it is computed based on the current situation
 */
function routeRobot( {place, parcels}, route ) {
    // create a new route if it's empty
    if ( route.length === 0 ) {
        let parcel = parcels[0];
        // if the parcel is not picked, find the path to it
        // in the other case, find it's address
        if ( parcel.place !== place ) {
            route = findPath(roadGraph, place, parcel.place);
        } else {
            route = findPath(roadGraph, place, parcel.address);
        }
    }
    // move on the computed route, and update it after the move
    return {
        direction: route[0],
        memory: route.slice(1)
    }
}

/**
 * This robot chooses it's route based on the state of it's current environment.
 * It computes all routes and moves on the shortest ones, giving advantage to those which contain a new parcel
 * Though I claimed it to be smart, it's efficiency is worse than that of the "routeRobot".
 * @param {instancof VillageState} state it stores the information about the robot's and parcels' location
 * @param {Object} memory an object with "route" and "picked" properties, to store the information about the moves
 */
function smartRobot( {place, parcels}, memory ) {
    // find the routes to all parcels
    let routes = parcels.map(parcel => {
        if ( parcel.place !== place ) {
            // if it's not picked, find it's place
            return {route: findPath(roadGraph, place, parcel.place), picked: false}
        } else {
            // find the parcel address
            return {route: findPath(roadGraph, place, parcel.address), picked: true}
        }
    });
    // Evaluates the importance of routes.
    // It's counted negatively. The ones not picked get an advantage.
    // The higher the score, the better
    function score( {route, picked} ) {
        return (!picked ? 0.5 : 0) - route.length;
    }

    if ( memory.length === 0 ) {
        // chose the most convenient route
        memory = routes.reduce((a, b) => score(a) > score(b) ? a : b).route;
    }
    return {
        direction: memory[0],
        memory: memory.slice(1)
    }
}
 
/**
 * the program run function
 * @param {instanceof VilageState} state it stores the information about the robot's and parcels' location
 * @param {function} robot The actual action function. It should take 2 parameters: 'state' and 'memory' to make the move based on them
 * @param {Array} memory An array of routes used by the robot to make the next move
 */
function runRobot( state, robot, memory ) {
    for ( let turn = 0; ; turn++ ) {
        // when there are no parcels left finish executing
        if ( state.parcels.length === 0 ) {
            console.log(`Finished after ${turn} truns.`);
            break;
        }
        action = robot( state, memory );
        // update the 'state' and 'memory' based on the "action made"
        state = state.move(action.direction);
        memory = action.memory;
        console.log(`Moved to ${action.direction}`);
    }
}

/**
 * This function compares 2 algorithms' efficiency in the same environment
 * @param {function} robot1 a parcel delivery algorithm
 * @param {Array} memory1 the initial "plan" of the 1st algohritm(it will try to first make these moves)
 * @param {function} robot2 a parcel delivery algorithm
 * @param {Array} memory2 the initial "plan" of the 2nd algohritm(it will try to first make these moves)
 */
function compareRobots( robot1, memory1, robot2, memory2 ) {
    function testRobot( state, robot, memory ) {
        for ( let turn = 0; ; turn++ ) {
            if ( state.parcels.length === 0 ) return turn;

            action = robot( state, memory );
            state = state.move(action.direction);
            memory = action.memory;
        }
    }
    const average = ( array ) => array.reduce((a, b) => a + b) / array.length;

    let testsLog1 = [], testsLog2 = [];
    for ( let i = 0; i < 1000; i++ ) {
        let randomState, test1, test2;
        randomState = VillageState.random();
        test1 = testRobot( randomState, robot1, memory1 );
        test2 = testRobot( randomState, robot2, memory2 );
        testsLog1.push(test1);
        testsLog2.push(test2);
    }
    console.log(robot1.name + " eficiency: " + average(testsLog1).toFixed(3));
    console.log(robot2.name + " eficiency: " + average(testsLog2).toFixed(3));
}

// run randomRobot
console.groupCollapsed('randomRobot');
runRobot(VillageState.random(), randomRobot);
console.groupEnd();

// run mailRobot
console.groupCollapsed('mailRobot');
runRobot(VillageState.random(), mailRobot, []);
console.groupEnd();

// run routeRobot
console.groupCollapsed('routeRobot');
runRobot(VillageState.random(), routeRobot, []);
console.groupEnd();
