# Fire-Emblem-Discord-Bot
A Node.js Discord bot simulating a Fire Emblem-like turn-based strategical RPG. For ease of use, it relies on a Google Sheet to setup its database.
Why a Discord bot? It's a long story. Maybe one day there'll be a graphical interface.

# Setting up your version of the bot
- [Make your own copy of this sheet](https://docs.google.com/spreadsheets/d/1FvJf1Hf-kL_tF9Pcqhh2OpPn87UixvOY31N3sIXnvR4/edit?usp=sharing). Fill the tabs to fit your game.
- [Follow the guide on how to setup a Discord.js bot up to the "Adding your bot to servers" part.](https://discordjs.guide/)
- Download the repository. Unzip it if necessary.
- At the root of the project's folder, create a `config.json` file containing the following with your own bot's values. Note that the ranges here are placeholders that fit the example sheet.
```
{
    "prefix": "your-chosen-prefix",
    "token": "your-bot-token"
    "sheetID": "your-sheet's-id",
    "statsRange": "Stats!A1:O9",
    "unitsRange": "Units!A1:BB33",
    "itemRange": "Items!A1:AK11",
    "wexpThresholds": [215, 135, 80, 40, 15, 0]
}
```
- [Follow the Google Sheets API quickstart steps 1 and 2.](https://developers.google.com/sheets/api/quickstart/nodejs)
- Launch the bot with `node .` then use the command `setup stats` then `setup units` in Discord.
- (WIP)

# Customizable data
While you can code your own features to the bot, the architecture is made for you to adapt to your game easily:
- Stat names and how much each primary stat affects a secondary stat (Stats sheet).
- Weapon Exp thresholds for weapon ranks (config.json).