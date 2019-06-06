function slowFunction(callback) {
    setTimeout(() => {
        console.log('1');
        callback();
    }, 2000);
}
function log1() {
    return new Promise((resolve) => {
        slowFunction(() => resolve('logged1'));
    });
}
function log2() {
    console.log('2');
}

async function main() {
    await log1();
    log2();
}

main();

// Promise.all like function
function PromiseAll(promises) {
    return new Promise((resolve, reject) => {
        const result = [];
        let pending = promises.length;
        for (let i = 0; i < promises.length; i++) {
            // eslint-disable-next-line no-loop-func
            promises[i].then((value) => {
                result[i] = value;
                pending -= 1;
                if (pending === 0) resolve(result);
            }).catch(reject);
        }
        if (promises.length === 0) resolve(result);
    });
}

class XError extends Error {}

// Test code.
PromiseAll([]).then((array) => {
    console.log('This should be []:', array);
});
function soon(val) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(val), Math.random() * 500);
    });
}
PromiseAll([soon(1), soon(2), soon(3)]).then((array) => {
    console.log('This should be [1, 2, 3]:', array);
});
PromiseAll([soon(1), Promise.reject(new XError('X')), soon(3)])
    .then((array) => {
        console.log('We should not get here', array);
    })
    .catch((error) => {
        if (!(error instanceof XError)) {
            console.log('Unexpected failure:', error);
        }
    });
