const Unit = function Unit(name) {
    this.name = name;
    this.tempMods = new Map();
};

Unit.prototype = {
    name: null,
    tempMods: null,
    addTempMod: function(modMap) {
        for([key, value] of modMap) {
            this.tempMods.set(key, value);
        }
    }
}

module.exports = Unit;