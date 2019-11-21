const Board = require('../game/board');
const Unit = require('../game/unit');

const currentBoard = new Board();
currentBoard.units.set("Calliope", new Unit("Calliope"));
currentBoard.units.set("Sandra", new Unit("Sandra"));
currentBoard.units.set("Eremos", new Unit("Eremos"));
currentBoard.units.set("Ellie", new Unit("Ellie"));
currentBoard.units.set("Eclo", new Unit("Eclo"));
currentBoard.units.set("Yam", new Unit("Yam"));

module.exports = {
	name: 'simulate',
	description: 'Simulates a battle between two units.',
	aliases: ['s', 'sim'],
    usage: 'InitiatingUnit [+NumberStatName] [-NumberStatName] v DefendingUnit [+NumberStatName] [-NumberStatName]',
    args: true,
	execute(commandMessage, args) {
        let initiatorName, defenderName;
        let tempMods = new Map();
        for (arg of args) {
            switch(arg.charAt(0)) {
                case '+':
                case '-':
                    parseTempMod(arg, tempMods, commandMessage)
                    break;
                case 'v':
                    if (arg != 'v') {
                        initiatorName = arg;
                    } else if (isDegenerate(initiatorName)) {
                        commandMessage.channel.send(`No initiator unit provided.`);
                        return;
                    } else {
                        addUnitTempMod(initiatorName, tempMods, commandMessage);
                        tempMods = new Map();
                    }
                    break;
                default:
                    if (isDegenerate(initiatorName)) {
                        initiatorName = arg;
                    } else {
                        defenderName = arg;
                    }
            }
        }
        if (isDegenerate(defenderName) && isDegenerate(initiatorName)) {
            commandMessage.channel.send(`\`${this.name}\` command usage:\n${this.usage}`);
            return;
        } else if (isDegenerate(defenderName)) {
            commandMessage.channel.send(`No defender unit provided.`);
        } else {
            addUnitTempMod(defenderName, tempMods, commandMessage);
        }
        buildCommandReply(initiatorName, defenderName, commandMessage);
    },
};

function addUnitTempMod(name, modMap, commandMessage) {
    if (currentBoard.units.has(name)) {
        currentBoard.units.get(name).addTempMod(modMap);
    }
    else {
        commandMessage.channel.send(`Provided unit does not exist.`);
        return;
    }
}

function parseTempMod(arg, map, commandMessage) {
    stat = arg.toLowerCase().replace(/[^a-z]/g, "");
    statMod = arg.replace(/[^-0-9]+/g, "");
    if (isDegenerateNumber(statMod) || isDegenerate(stat) || stat === "") {
        commandMessage.channel.send(`The argument ${arg} is invalid: ${stat}, ${statMod}`);
    }
    if (map.has(stat)) {
        map.set(stat, Number(map.get(stat)) + Number(statMod));
    }
    else {
        map.set(stat, statMod);
    }
}

function buildCommandReply(initiator, defender, commandMessage) {
    let reply = `${initiator} engages ${defender}!`;
    if (currentBoard.units.get(initiator).tempMods.size > 0) {
        reply += `\n${initiator}'s temporary modifiers:`;
        for (const [key, value] of currentBoard.units.get(initiator).tempMods) {
            console.log(`${key}: ${value}`)
            reply += `\n${key}: ${value}`;
        }
    }
    if (currentBoard.units.get(defender).tempMods.size > 0) {
        reply += `\n${defender}'s temporary modifiers:`;
        for (const [key, value] of currentBoard.units.get(defender).tempMods) {
            reply += `\n${key}: ${value}`;
        }
    }
    commandMessage.channel.send(reply);
}

function isDegenerate(valueToTest) {
    return typeof valueToTest === "undefined" || valueToTest === null;
}
function isDegenerateNumber(valueToTest) {
    return typeof valueToTest === "undefined" || valueToTest === null || isNaN(valueToTest);
}