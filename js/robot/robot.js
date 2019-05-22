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
function routeRobot( state, memory ) {
    if ( memory.length === 0 ) {
        memory = mailRoute;
    }
    return {
        direction: memory[0],
        memory: memory.slice(1)
    };
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
// run randomRobot
console.groupCollapsed('randomRobot');
runRobot(VillageState.random(), randomRobot);
console.groupEnd();

// run routeRobot
console.group('routeRobot');
runRobot(VillageState.random(), routeRobot, []);
console.groupEnd();
