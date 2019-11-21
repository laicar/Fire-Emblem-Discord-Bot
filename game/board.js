const Board = function Board() {
    this.units = new Map();
};

Board.prototype = {
    units: null,
};

module.exports = Board;