const PrimaryStat = function PrimaryStat(name) {
    this.name = name;
};

PrimaryStat.prototype = {
    name: null,
    isSecondary: false,
};

const SecondaryStat = function SecondaryStat(name, formulaMap) {
    this.name = name;
    this.formulaMap = formulaMap;
};

SecondaryStat.prototype = {
    name: null,
    isSecondary: true,
    formulaMap: null,
    calculateValue: function(unitPrimaryStats) {
        const flatModifier = this.formulaMap.get('(Flat Modifier');
        let sStatValue = flatModifier ? flatModifier : 0;
        for ([pStat, pStatValue] of unitPrimaryStats) {
            if (this.formulaMap.has(pStat)) {
                sStatValue += Math.floor(this.formulaMap.get(pStat) * pStatValue);
            }
        }
        return sStatValue;
    }
};

const WeaponRank = function WeaponRank(weaponType, exp) {
    this.weaponType = weaponType;
    this.exp = exp;
};

WeaponRank.prototype = {
    weapon: null,
    exp: null,
    //Change these total exp thresholds to suit your needs, but keep them decreasing.
    //Beware that there's no check for not looping back to S.
    expThresholds: [215, 135, 80, 40, 15, 0],
    getRank: function() {
        if (this.exp > this.expThresholds[0]) return 'S';
        for (let i = 1; i < this.expThresholds.length; i++) {
            if (this.exp > this.expThresholds[i]) return String.fromCharCode(64 + i);
        }
        return '-';
    },

};

module.exports = {PrimaryStat, SecondaryStat, WeaponRank};