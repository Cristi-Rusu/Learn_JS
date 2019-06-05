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
