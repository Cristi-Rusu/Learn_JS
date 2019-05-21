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
    edges = edges.map(edge => edge.split('-'));
    // add all the possible routes from the 'edges' given 
    for ( let [from, to] of edges ) {
        addEdge(from, to);
        addEdge(to, from);
    }
    return graph;
}

let roadGraph = builGraph( roads );
console.log(roadGraph);

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
                // it's address remains the same
                return {place: destination, address: p.address};
            // exclude the delivered parcels after the move("make the delivery")
            }).filter(p => p.place !== p.address );
            // update the state of the village with the new parameters
            return new VillageState( destination, parcels );
        }
    }
}

