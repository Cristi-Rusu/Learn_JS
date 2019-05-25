/* Bugs and Errors */
class MultiplicatorUnitFailure extends Error { }

function primitiveMultiply(a, b) {
    if (Math.random() < 0.2) {
        return a * b;
    } else {
        throw new MultiplicatorUnitFailure("Klunk");
    }
}
// retry multiplying until no exception is met
function reliableMultiply(a, b) {
    for (; ;) {
        try {
            return primitiveMultiply(a, b);
        } catch (e) {
            if (e instanceof MultiplicatorUnitFailure) {
                console.log("Failed to multiply. Trying again.");
            } else {
                throw e;
            }
        }
    }

}


const box = {
    locked: true,
    unlock() { this.locked = false; },
    lock() { this.locked = true; },
    _content: [],
    get content() {
        if (this.locked) throw new Error("Locked!");
        return this._content;
    }
};

function withBoxUnlocked(action) {
    let locked = box.locked;
    if ( locked ) box.unlock();
    try {
        action();
    } finally {
        if ( locked ) {
            box.lock();
        }
    }
}

withBoxUnlocked(function () {
    box.content.push("gold piece");
});

try {
    withBoxUnlocked(function () {
        throw new Error("Pirates on the horizon! Abort!");
    });
} catch (e) {
    console.log("Error raised: " + e);
}
console.log(box.locked);
