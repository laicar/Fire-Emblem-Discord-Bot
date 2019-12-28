const {wexpThresholds} = require('../config.json');
const Discord = require('discord.js');

const Unit = function Unit(attributes, learnedSkills, bases, growths) {
    this.attributes = attributes;
    this.bases = bases;
    this.growths = growths;
    this.learnedSkills = learnedSkills;
    this.tempMods = new Map();
};

Unit.prototype = {
    attributes: null,
    bases: null,
    growths: null,
    currentStats: null,
    learnedSkills: null,
    displayedSkills: null,
    effectiveSkills: null,
    wpnRanks : null,
    tempMods: null,
    setCurrentStats: function(level) {
        for (const stat of this.bases.keys()) {
            this.currentStats.set(this.bases.get(stat) + Math.floor(this.growths.get(stat) * level));
        }
    },
    getWpnRank: function(wpnType) {
        const exp = this.wpnRanks.get(wpnType);
        if (isNaN)
        if (exp > wexpThresholds[0]) return 'S';
        for (let i = 1; i < wexpThresholds.length; i++) {
            if (exp > wexpThresholds[i]) return String.fromCharCode(64 + i);
        }
        return '-';
    },
    incrementWpnExp: function(wpnType, increment = 1) {
        if (this.wpnRanks.has(wpnType)) {
            this.wpnRanks.set(wpnType, this.wpnRanks.get(wpnType) + increment);
        } else {
            this.wpnRanks.set(wpnType, increment);
        }
    },
    embed: function() {
        const embed = new Discord.RichEmbed();
        embed.setAuthor(`${this.attributes.get("Player")}'s ${this.attributes.get("Class")}`, this.attributes.get("Image Link") )
        embed.setTitle(this.attributes.get("Name"));
        for (const stat of this.bases.keys()) {
            embed.addField(stat, `${this.bases.get(stat)} | ${this.growths.get(stat)}`, true);
        }
        for (let i = (this.bases.size % 3); i > 1; i--) {
            embed.addField("\u200b", "\u200b", true);            
        }
        embed.addField("\u200b", "\u200b");
        for (const [key, value] of this.learnedSkills) {
            embed.addField("Skills", `${key}\nLvl ${value}`, true);
        }
        embed.setFooter(this.attributes.get("Affiliation"))
        return embed;
    }
}

module.exports = Unit;