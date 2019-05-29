/* Bugs and Errors */

/* eslint no-underscore-dangle: ["error", { "allow": ["_content"] }] */

class MultiplicatorUnitFailure extends Error { }

function primitiveMultiply(a, b) {
  if (Math.random() < 0.2) {
    return a * b;
  }
  throw new MultiplicatorUnitFailure('Clunk');
}
// retry multiplying until no exception is met
function reliableMultiply(a, b) {
  for (;;) {
    try {
      return primitiveMultiply(a, b);
    } catch (e) {
      if (e instanceof MultiplicatorUnitFailure) {
        console.log('Failed to multiply. Trying again.');
      } else {
        throw e;
      }
    }
  }
}

console.log(reliableMultiply(3, 5));

const box = {
  locked: true,
  unlock() { this.locked = false; },
  lock() { this.locked = true; },
  _content: [],
  get content() {
    if (this.locked) throw new Error('Locked!');
    return this._content;
  },
};

function withBoxUnlocked(action) {
  const { locked } = box;
  if (locked) box.unlock();
  try {
    action();
  } finally {
    if (locked) {
      box.lock();
    }
  }
}

withBoxUnlocked(() => {
  box.content.push('gold piece');
});

try {
  withBoxUnlocked(() => {
    throw new Error('Pirates on the horizon! Abort!');
  });
} catch (e) {
  console.log(`Error raised: ${e}`);
}
console.log(box.locked);
