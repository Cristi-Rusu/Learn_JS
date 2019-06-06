//
// ──────────────────────────────────────────────────────────────────────────────────────── I ──────────
//   :::::: P R O G R A M M I N G   L A N G U A G E   E G G : :  :   :    :     :        :          :
// ──────────────────────────────────────────────────────────────────────────────────────────────────
//

/* eslint-disable no-use-before-define */
/* eslint-disable no-new-func */
/* eslint-disable no-cond-assign */

const prog1 = {
    name: 'Program1',
    code: '+(a, 10)',
};
const prog2 = {
    name: 'Program2',
    code: 'multiplier(2)(1)',
};
const prog3 = {
    name: 'Program3',
    code: `
    do(define(x, 10),
       if(<(x, 5),
          print("large"),
          print("small")))
    `,
};
const prog4 = {
    name: '1 to 10 sum',
    code: `
    do(define(total, 0),
       define(count, 1),
       while(<(count, 11),
             do(define(total, +(total, count)),
                define(count, +(count, 1)))),
       print("Prog4 -> total:", total))
    `,
};
const prog5 = {
    name: 'Plus 1',
    code: `
    do(define(plusOne, fun(a, +(a, 1))),
       print("Prog5 -> plusOne(10):", plusOne(10)))
    `,
};
const prog6 = {
    name: 'Array sum',
    code: `
    do(define(sum, fun(array,
        do(define(i, 0),
           define(sum, 0),
           while(<(i, length(array)),
             do(define(sum, +(sum, element(array, i))),
                define(i, +(i, 1)))),
           # write 'sum' in the end because the 'do' block takes the
           # return value of it's last argument
           sum))),
      print("Prog6 -> Array sum:", sum(array(1, 2, 3))))
    `,
};
const prog7 = {
    name: 'Change x value in the outer scope:',
    code: `
    do(define(x, 4),
                           # changes 'x' in the outer scope
       define(setx, fun(val, set(x, val))),
       setx(50),
       print("Prog7 -> Change 'x' in the outer scope:", x))
    `,
};

//
// ─── PARSER ─────────────────────────────────────────────────────────────────────
//

// trims the space before the first character in a string
function skipSpace(string) {
    // allow python-like comments in Egg
    const skippable = string.match(/^(\s|#.*)*/);
    return string.slice(skippable[0].length);
}

// 'parseExpression' and 'parseApply' generate the syntax tree
// recursively, calling each other

function parseExpression(program) {
    program = skipSpace(program);
    let match;
    let expr;
    if (match = /^"([^"]*)"/.exec(program)) {
        expr = { type: 'value', value: match[1] };
    } else if (match = /^\d+\b/.exec(program)) {
        expr = { type: 'value', value: Number(match[0]) };
    } else if (match = /^[^\s(),"#]+/.exec(program)) {
        expr = { type: 'word', name: match[0] };
    } else {
        throw new SyntaxError(`Unexpected syntax: ${program}`);
    }
    // parse the next piece of code
    return parseApply(expr, program.slice(match[0].length));
}
// checks whether the expression is a application
// and parses it
function parseApply(expr, program) {
    program = skipSpace(program);
    // if the expression is not an application
    // return the syntax tree
    if (program[0] !== '(') {
        return { expr, rest: program };
    }

    program = skipSpace(program.slice(1));
    expr = { type: 'apply', operator: expr, args: [] };
    while (program[0] !== ')') {
        const arg = parseExpression(program);
        expr.args.push(arg.expr);
        program = skipSpace(arg.rest);
        if (program[0] === ',') {
            program = skipSpace(program.slice(1));
        } else if (program[0] !== ')') {
            throw new SyntaxError(`Expected "," or ")": ${program}`);
        }
    }
    // call the parser one more time because applications can also be applied
    // i.e. multiplier(2)(1)
    return parseApply(expr, program.slice(1));
}

function parse(program) {
    const { expr, rest } = parseExpression(program);
    if (skipSpace(rest).length > 0) {
        throw new SyntaxError('Unexpected text after program.');
    }
    return expr;
}
//
// ─────────────────────────────────────────────────────────────────── PARSER ─────
//

console.log(`${prog1.name} syntax tree:`, parse(prog1.code));
console.log(`${prog2.name} syntax tree:`, parse(prog2.code));
console.log(`${prog3.name} syntax tree:`, parse(prog3.code));

//
// ─── EVALUATOR ──────────────────────────────────────────────────────────────────
//

// used to define special syntax for the language
const specialForms = Object.create(null);

// it's similar to the javascript's ternary (?:) operator
// if the statement is true return the first arg, otherwise, the second
// only the precise value of 'false' is treated as a false statement(0, "", null don't)
specialForms.if = (args, scope) => {
    if (args.length !== 3) {
        throw new SyntaxError('"if" should have 3 arguments');
    }
    if (evaluate(args[0], scope) !== false) {
        return evaluate(args[1], scope);
    }
    return evaluate(args[2], scope);
};

specialForms.while = (args, scope) => {
    if (args.length !== 2) {
        throw new SyntaxError('"while" should have 2 arguments');
    }
    while (evaluate(args[0], scope)) {
        evaluate(args[1], scope);
    }
    // 'undefined' does not exist in Egg(the language)
    // so we return false for lack of meaningful result
    return false;
};

// the arguments passed to 'do' are executed from top to bottom
// it's return value is the value returned by the last argument
specialForms.do = (args, scope) => {
    let value = false;
    for (const arg of args) {
        value = evaluate(arg, scope);
    }
    return value;
};

// defines a new binding to the current scope
// first argument should be a 'word'
specialForms.define = (args, scope) => {
    if (args[0].type !== 'word') {
        // eslint-disable-next-line max-len
        throw new SyntaxError('"define" should have a "word" as the first argument');
    } else if (args.length !== 2) {
        throw new SyntaxError('"define" should have 2 arguments');
    }
    const value = evaluate(args[1], scope);
    scope[args[0].name] = value;
    return value;
};

specialForms.set = (args, scope) => {
    if (args[0].type !== 'word') {
        // eslint-disable-next-line max-len
        throw new SyntaxError('"set" should have a "word" as the first argument');
    } else if (args.length !== 2) {
        throw new SyntaxError('"set" should have 2 arguments');
    }
    const value = evaluate(args[1], scope);
    while (Object.getPrototypeOf(scope) !== null) {
        if (Object.prototype.hasOwnProperty.call(scope, args[0].name)) {
            scope[args[0].name] = value;
            return value;
        }
        scope = Object.getPrototypeOf(scope);
    }
    throw new ReferenceError(`${args[0].name} is undefined`);
};

// define functions
specialForms.fun = (args, scope) => {
    if (!args.length) {
        throw new SyntaxError('Functions should have a body');
    }
    const body = args[args.length - 1];
    const params = args.slice(0, args.length - 1).map((expr) => {
        if (expr.type !== 'word') {
            throw new SyntaxError('Parameters should be words');
        }
        return expr.name;
    });

    return function fun() {
        if (arguments.length !== params.length) {
            throw new SyntaxError('Wrong number of arguments');
        }
        const localScope = Object.create(scope);
        for (let i = 0; i < arguments.length; i++) {
            // eslint-disable-next-line prefer-rest-params
            localScope[params[i]] = arguments[i];
        }
        return evaluate(body, localScope);
    };
};

// runs the syntax tree
function evaluate(expr, scope) {
    if (expr.type === 'value') {
        return expr.value;
    }
    // if the 'expr' type is a 'word'
    // check if it is in the current scope and return it's value or an Error
    if (expr.type === 'word') {
        if (expr.name in scope) {
            return scope[expr.name];
        }
        throw new ReferenceError(`Undefined binding ${expr.name}`);
    }
    if (expr.type === 'apply') {
        const { operator, args } = expr;
        // if the operator is contained in the 'specialForms'
        // pass the arguments to the specific function from 'specialForms'
        if (operator.type === 'word' && operator.name in specialForms) {
            return specialForms[operator.name](expr.args, scope);
        }
        // evaluate op to see if it's a function
        const op = evaluate(operator, scope);
        // if it is, call it with the evaluated arguments; else, throw a TypeError
        if (typeof op === 'function') {
            return op(...args.map(arg => evaluate(arg, scope)));
        }
        throw new TypeError('Applying a non-function.');
    }
    throw new TypeError('Invalid type');
}
//
// ──────────────────────────────────────────────────────────────── EVALUATOR ─────
//
//
// ─── THE ENVIRONMENT ────────────────────────────────────────────────────────────
//

// define the global scope of the language
const topScope = Object.create(null);
topScope.true = true;
topScope.false = false;
// define arithmetic operations
for (const op of ['+', '-', '*', '/', '==', '<', '>']) {
    topScope[op] = Function('a, b', `return a ${op} b;`);
}
topScope.print = (...values) => {
    console.log(...values);
    return false;
};
topScope.array = (...values) => [...values];
topScope.length = array => array.length;
topScope.element = (array, index) => array[index];
//
// ────────────────────────────────────────────────────────── THE ENVIRONMENT ─────
//
//
// ─── RUN PROGRAM ────────────────────────────────────────────────────────────────
//
function run(program) {
    return evaluate(parse(program), Object.create(topScope));
}

run(prog4.code);
run(prog5.code);
run(prog6.code);
run(prog7.code);
