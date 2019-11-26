const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const {sheetID, statsRange} = require('../config.json');
const {PrimaryStat, SecondaryStat} = require('../game/stat');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

let stats = [];

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
 * 
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
		if (err) return console.log('The API returned an error: ' + err);
		const rows = res.data.values;
		if (rows.length) {
			//j = 2 because the first cell is empty and the second one is that flat modifier.
			for (let j = 2; j < rows[0].length; j++) {
				stats.push(new PrimaryStat(rows[0][j]));
			}
			for (let i = 1; i < rows.length; i++) {
				if (rows[i][0]) {
					let pStatFormulaMap = new Map();
					for (let j = 1; j < rows[i].length; j++) {
						if (rows[i][j]) {
							pStatFormulaMap.set(rows[0][j], rows[i][j])
						}
					}
					stats.push(new SecondaryStat(rows[i][0], pStatFormulaMap));
				}
			}
			console.log(stats);
			message.channel.send(`Stat setup complete.`);
		} else {
			message.channel.send(`No stat data found.`);
		}
	});
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
	usage: 'all|units|items|stats|inventory [Tab!TopLeftCell:BottomRightCell]',
	args: true,
	cooldown: 5,
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
				case 'all':
					authorize(JSON.parse(content), setupStats, message, null);
					break;
				default:
					message.channel.send(`Invalid argument. Valid arguments are: ${this.usage}`);
			}
		});
	}
};