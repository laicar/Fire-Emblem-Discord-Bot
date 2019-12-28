const {isDegenerate, isDegenerateNumber} = require('../utils/utils');
const teamQ = require('../index')

module.exports = {
	name: 'simulate',
	description: 'Simulates a battle between two units.',
	aliases: ['s', 'sim'],
	usage: 'InitiatingUnit [+NumberStatName] [-NumberStatName] v DefendingUnit [+NumberStatName] [-NumberStatName]',
	args: true,
	execute(commandMessage, args) {
		try {
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
							const errorMessage = `No initiator unit provided.`;
							commandMessage.channel.send(errorMessage);
							throw errorMessage;
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
				throw `Wrong simulate command usage.`;
			} else if (isDegenerate(defenderName)) {
				const errorMessage = `No defender unit provided.`;
				commandMessage.channel.send(errorMessage);
				throw errorMessage;
			} else {
				addUnitTempMod(defenderName, tempMods, commandMessage);
			}
			buildCommandReply(initiatorName, defenderName, commandMessage);
		} catch (error) {
			console.error(error);
			return;
		}
	}
};

function addUnitTempMod(name, modMap, commandMessage) {
	if (teamQ.currentBoard.units.has(name)) {
		const unit = teamQ.currentBoard.units.get(name);
		for([key, value] of modMap) {
            unit.tempMods.set(key, value);
        }
	}
	else {
		const errorMessage = `Provided unit does not exist.`;
		commandMessage.channel.send(errorMessage);
		throw errorMessage;
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
	if (teamQ.currentBoard.units.get(initiator).tempMods.size > 0) {
		reply += `\n${initiator}'s temporary modifiers:`;
		for (const [key, value] of teamQ.currentBoard.units.get(initiator).tempMods) {
			console.log(`${key}: ${value}`)
			reply += `\n${key}: ${value}`;
		}
	}
	if (teamQ.currentBoard.units.get(defender).tempMods.size > 0) {
		reply += `\n${defender}'s temporary modifiers:`;
		for (const [key, value] of teamQ.currentBoard.units.get(defender).tempMods) {
			reply += `\n${key}: ${value}`;
		}
	}
	commandMessage.channel.send(reply);
}