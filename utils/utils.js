//const op = '+'; operator[op](a, b);
const operator = {
    '+': function(a, b) { return a + b },
    '-': function(a, b) { return a - b },
    '*': function(a, b) { return a * b },
    '/': function(a, b) { return a / b },
    '%': function(a, b) { return a % b },
    '<': function(a, b) { return a < b },
    '>': function(a, b) { return a > b },
    '<=': function(a, b) { return a <= b },
    '>=': function(a, b) { return a >= b },
    '!=': function(a, b) { return a !== b },
    '=': function(a, b) { return a === b },
};

function isDegenerate(valueToTest) {
	return typeof valueToTest === "undefined" || valueToTest === null;
}
function isDegenerateNumber(valueToTest) {
	return typeof valueToTest === "undefined" || valueToTest === null || isNaN(valueToTest);
}

module.exports = {operator, isDegenerate, isDegenerateNumber};