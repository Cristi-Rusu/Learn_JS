/* Modules */

// this is an immediately invoked function
// the 'names' variables remains in the function's scope, so it can't be accessed by outside it
// modules were created this way before 2015
const weekDay = (function weekDay() {
    const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
        'Thursday', 'Friday', 'Saturday'];
    return {
        name(number) { return names[number]; },
        number(name) { return names.indexOf(name); },
    };
}());
// because 'weekDay' is immediately invoked,
// the global scope treats it as an object(it's return value)
console.log(weekDay.name(weekDay.number('Tuesday')));
