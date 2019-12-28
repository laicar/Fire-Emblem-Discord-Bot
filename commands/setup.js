const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const {sheetID, statsRange, unitsRange} = require('../config.json');
const teamQ = require('../index')
const {isDegenerate} = require('../utils/utils');
const Unit = require('../game/unit');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 * @param {Object} message The Discord command message.
 * @param {String} range The Google Sheets range to read in A1 notation.
 */
function authorize(credentials, callback, message, range) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
	  client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
	if (err) return getNewToken(oAuth2Client, callback, message, range);
	oAuth2Client.setCredentials(JSON.parse(token));
	callback(oAuth2Client, message, range);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 * @param {Object} message The Discord command message.
 * @param {String} range The Google Sheets range to read in A1 notation.
 */
function getNewToken(oAuth2Client, callback, message, range) {
  const authUrl = oAuth2Client.generateAuthUrl({
	access_type: 'offline',
	scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
	rl.close();
	oAuth2Client.getToken(code, (err, token) => {
	  if (err) return console.error('Error while trying to retrieve access token', err);
	  oAuth2Client.setCredentials(token);
	  // Store the token to disk for later program executions
	  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
		if (err) return console.error(err);
		console.log('Token stored to', TOKEN_PATH);
	  });
	  callback(oAuth2Client, message, range);
	});
  });
}

/**
 * Read unit data from a spreadsheet and update bot accordingly.
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 * @param {Object} message The Discord command message.
 * @param {String} range The Google Sheets range to read in A1 notation.
 */
function setupUnits(auth, message, range) {
	if (range === null) range = unitsRange;
	const gSheets = google.sheets({version: 'v4', auth});
	gSheets.spreadsheets.values.get({
		spreadsheetId: sheetID,
		range: range,
		majorDimension: "COLUMNS",
	}, (err, res) => {
		if (err) {
			message.channel.send(`Error during unit setup.`);
			return console.log('The API returned an error during unit setup: ' + err);
		}
		const resultColumns = res.data.values;
		if (resultColumns.length) {
			teamQ.playerUnits = new Map(); //TODO remove that once board creation is properly done
			for (let i = 1; i < resultColumns.length; i++) {
				const attributes = new Map();
				const statsBases = new Map();
				const statsGrowths = new Map();
				const skills = new Map();
				for (let j = 0; j < resultColumns[i].length; j++) {
					if (resultColumns[0][j].endsWith("Base")) {
						try {
							addUnitStat(statsBases, message, resultColumns[0][j], resultColumns[i][j]);
						} catch (error) {
							console.error(error);
							return;
						}
					} else if (resultColumns[0][j].endsWith("Growth")) {
						try {
							addUnitStat(statsGrowths, message, resultColumns[0][j], resultColumns[i][j]);
						} catch (error) {
							console.error(error);
							return;
						}
					} else if (checkSkillHeaders(resultColumns, j)) {
						skills.set(resultColumns[i][j], resultColumns[i][j+1]);
						j++;
					}
					else {
						attributes.set(resultColumns[0][j], resultColumns[i][j]);//Placeholder for the rest of the attributes
					}
				}
				unit = new Unit(attributes, skills, statsBases, statsGrowths);
				teamQ.playerUnits.set(unit.attributes.get("Name"), unit); //TODO update that if needed
				message.channel.send(unit.embed());
			}
			teamQ.createBoard();//TODO remove that once the board is properly created
			message.channel.send(`Unit setup complete.`);
		} else {
			message.channel.send(`No unit data found.`);
		}
	});

	function checkSkillHeaders(resultColumns, j) {
		const header1 = resultColumns[0][j].split(" ");
		const header2 = resultColumns[0][j+1].split(" ");
		return header1[0] === "Skill" && header2[0] === "Skill" && header1[1] === header2[1] && header2[2] === "Level";
	}

	function addUnitStat(map, message, headerCell, dataCell) {
		const stat = headerCell.split(" ")[0];
		if (teamQ.statNames.includes(stat)) {
			map.set(stat, dataCell);
		} else {
			message.channel.send(`Stat ${stat} unknown. Please setup the stats and verify the spreadsheet.`);
			throw `Unknown stat ${stat} during unit stats setup`;
		}
	}
}

/**
 * Read stat data from a spreadsheet and update bot accordingly.
 * Stats are divided into primary and secondary,
 * with secondary stats being a linear function of primary stats
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 * @param {Object} message The Discord command message.
 * @param {String} range The Google Sheets range to read in A1 notation.
 */
function setupStats(auth, message, range) {
	if (range === null) range = statsRange;
	const gSheets = google.sheets({version: 'v4', auth});
	gSheets.spreadsheets.values.get({
		spreadsheetId: sheetID,
		range: range,
	}, (err, res) => {
		if (err) {
			message.channel.send(`Error during stat setup.`);
			return console.log('The API returned an error during stat setup: ' + err);
		}
		if (res.data.values.length) {
			teamQ.statNames.length = 0;
			setupPrimaryStats(res.data.values);
			setupSecondaryStats(res.data.values);
			message.channel.send(`Stat setup complete.\n${teamQ.statNames.join(", ")}`);
		} else {
			message.channel.send(`No stat data found.`);
		}
	});

	function setupSecondaryStats(resultRows) {
		for (let i = 1; i < resultRows.length; i++) {
			if (resultRows[i][0]) {
				teamQ.statNames.push(resultRows[i][0]);
				let statFormulaMap = new Map();
				for (let j = 1; j < resultRows[i].length; j++) {
					if (resultRows[i][j]) {
						statFormulaMap.set(resultRows[0][j], resultRows[i][j]);
					}
				}
				teamQ.secondaryStatFormulas.set(resultRows[i][0], statFormulaMap);
			}
		}
	}

	function setupPrimaryStats(resultRows) {
		//j = 2 because the first cell is empty and the second one is that flat modifier.
		for (let j = 2; j < resultRows[0].length; j++) {
			teamQ.statNames.push(resultRows[0][j]);
		}
	}
}
/*
function columnNumberToLetter(number) {
	number++;
	let temp, letter = '';
	while (number > 0) {
		temp = (number - 1) % 26;
		letter = String.fromCharCode(temp + 65) + letter;
		number = (number - temp - 1) / 26;
	}
	return letter;
}
*/
/*
function lettersToColumnNumber(letters) {
	let number = 0;
	for (let i = letters.length - 1; i >= 0; i--) {
		number += (letters.charCodeAt(i) - 64) * (Math.pow(26, letters.length - (i + 1)));
	}
	return number - 1;
}
*/

module.exports = {
	name: 'setup',
	description: `Sets up the bot\'s database, either whole or only partially.
Except for the 'all' first argument, the command accepts a second argument detailing the Google Sheet range to read.
If only one argument is provided, the hardcoded default range will be used.`,
	usage: 'units|items|stats|inventory [Tab!TopLeftCell:BottomRightCell]',
	args: true,
	cooldown: 2,
	execute(message, args) {
		// Load client secrets from a local file.
		fs.readFile('credentials.json', (err, content) => {
			if (err) return console.log('Error loading client secret file:', err);
			const range = args.length > 1 ? args[1] : null;
			// Authorize a client with credentials, then call the Google Sheets API.
			switch (args[0]) {
				case 'stats':
					authorize(JSON.parse(content), setupStats, message, range);
					break;
				case 'units':
					if (isDegenerate(teamQ) || isDegenerate(teamQ.statNames.length === 0)) {
						message.channel.send("Stats must be initialized first.")
						break;
					}
					authorize(JSON.parse(content), setupUnits, message, range);
					break;
				default:
					message.channel.send(`Invalid argument. Valid arguments are: ${this.usage}`);
			}
		});
	}
};