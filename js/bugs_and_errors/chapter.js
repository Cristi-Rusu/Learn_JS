/* Bugs and Errors */

// convert a whole number into a string in a specific base
function numberToString(n, base) {
    let result = "", sign = "";
    if ( n < 0 ) {
        sign = "-";
        n = -n;
    }
    do {
        // convert the number into the given 'base'
        // by repeatedly picking out the last digit and then dividing the number to get rid of this digit
        result = String(n % base) + result;
        n = Math.floor(n / base);
    } while (n > 0);
    return sign + result;
}
// console.log(numberToString(13, 8));

/**
 * Exceptions and Error Handling
 */
function promptDirection( question ) {
    let result  = prompt(question);
    if ( result.toLowerCase() === "left" ) return "L";
    if ( result.toLowerCase() === "right" ) return "R";
    throw new Error(`Invalid direction: ${result}`);
}

function look() {
    if ( promptDirection("Which way?") === "L" ) {
        return "a house";
    } else {
        return "two angry bears";
    }
}

// If an exception  occours in the 'try' block, the 'catch' block takes it as an argument and dictates what to do next.
// try {
//     console.log("You see:", look());
// } catch(error) {
//     console.log("Something went wrong: ", error);
// }

/**
 * Cleaning up after exceptions 
 */
const accounts = {
    a: 100,
    b: 0,
    c: 20
}

function getAccount() {
    let accountName = prompt("Enter an account name:");
    if ( !accounts.hasOwnProperty(accountName) ) {
        throw new Error(`No such account ${accountName}.`);
    }
    return accountName;
}

function transfer( from, amount ) {
    if ( accounts[from] < amount ) return;
    let progress = 0;
    try {
        accounts[from] -= amount;
        progress = 1;
        accounts[getAccount()] += amount;
        progress = 2;
    // the 'finally' block executes no matter what happens, after trying to run the 'try' block
    } finally {
        // if the transaction was aborted on 'progress' === 1, add the transfered amount back to the account
        if ( progress === 1 ) {
            accounts[from] += amount;
        }
    }
}

/**
 * Selective catching
 */

// To spot a specific kind of error we can create a new instance of Error and check it with the 'instanceof' operator.
// If it's not the one we are expecting, often times it's better to just throw it.
class InputError extends Error {}

function promptDir( question ) {
    let result = prompt(question);
    if (result.toLowerCase() == "left") return "L";
    else if (result.toLowerCase() == "right") return "R";
    else if (result.toLowerCase() == "up") return "U";
    else if (result.toLowerCase() == "down") return "D";
    else throw new InputError(`Invalid direction ${result}.`)
}

function askDirection() {
    for (;;) {
        try {
            let dir = promtDir("Where to?");
            console.log(`You chose ${dir}`);
            break;
        } catch(e) {
            if ( e instanceof InputError ) {
                console.log("Not a valid direction. Try again.")
            } else {
                throw e;
            }
        }
    }
}
