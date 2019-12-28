const Board = require('./board');

//TODO: exp formulas, doubling formula

const Game = function Game() {
    this.statNames = [];
    this.secondaryStatFormulas = new Map();
}

Game.prototype = {
    statNames: null,
    secondaryStatFormulas: null,
    currentBoard: null,
    playerUnits: null,
    calcSecondaryStat: function(sStatFormula, unitPStats) {
        let result = sStatFormula.get('Flat Mod') || 0;
        for ([pStat, coef] of unitPStats) {
            if (sStatFormula.has(pStat)) {
                result += sStatFormula.get(pStat) * coef;
            }
        }
        return Math.floor(result);
    },
    createBoard: function() {
        this.currentBoard = new Board();
        for (const [unitName, unit] of this.playerUnits) {
            this.currentBoard.units.set(unitName, unit);
        }
    }
}

module.exports = Game;