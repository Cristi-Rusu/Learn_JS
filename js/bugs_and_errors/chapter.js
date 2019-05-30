/* Bugs and Errors */

/* eslint-disable no-alert */

// convert a whole number into a string in a specific base
function numberToString(n, base) {
    let result = '';
    let sign = '';
    if (n < 0) {
        sign = '-';
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
console.log(numberToString(13, 8));

/**
 * Exceptions and Error Handling
 */
function promptDirection(question) {
    const result = prompt(question);
    if (result.toLowerCase() === 'left') return 'L';
    if (result.toLowerCase() === 'right') return 'R';
    throw new Error(`Invalid direction: ${result}`);
}

// eslint-disable-next-line no-unused-vars
function look() {
    if (promptDirection('Which way?') === 'L') {
        return 'a house';
    }
    return 'two angry bears';
}

// If an exception  occurs in the 'try' block, the 'catch' block takes it as an argument and dictates what to do next.
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
    c: 20,
};

function getAccount() {
    const accountName = prompt('Enter an account name:');
    if (!Object.prototype.hasOwnProperty.call(accounts, accountName)) {
        throw new Error(`No such account ${accountName}.`);
    }
    return accountName;
}

// eslint-disable-next-line no-unused-vars
function transfer(from, amount) {
    if (accounts[from] < amount) return;
    let progress = 0;
    try {
        accounts[from] -= amount;
        progress = 1;
        accounts[getAccount()] += amount;
        progress = 2;
    // the 'finally' block executes no matter what happens, after trying to run the 'try' block
    } finally {
    // if the transaction was aborted on 'progress' === 1, add the transferred amount back to the account
        if (progress === 1) {
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

function promptDir(question) {
    const result = prompt(question);
    if (result.toLowerCase() === 'left') return 'L';
    if (result.toLowerCase() === 'right') return 'R';
    if (result.toLowerCase() === 'up') return 'U';
    if (result.toLowerCase() === 'down') return 'D';
    throw new InputError(`Invalid direction ${result}.`);
}

// eslint-disable-next-line no-unused-vars
function askDirection() {
    // this kind of loop runs until a 'break', 'return' or 'throw' is met
    for (;;) {
        try {
            const dir = promptDir('Where to?');
            console.log(`You chose ${dir}`);
            break;
        } catch (e) {
            // If the exception occurred because of invalid input, log the problem and try again
            if (e instanceof InputError) {
                console.log('Not a valid direction. Try again.');
                // Otherwise it means it's a program error. You want to spot it immediately, so throw it.
            } else {
                throw e;
            }
        }
    }
}
