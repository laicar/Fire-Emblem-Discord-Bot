# Fire-Emblem-Discord-Bot
A Node.js Discord bot simulating a Fire Emblem-like turn-based strategical RPG. For ease of use, it relies on a Google Sheet to setup its database.

# Setting up your version of the bot
- [Follow the guide on how to setup a Discord.js bot up to the "Adding your bot to servers" part.](https://discordjs.guide/)
- [Make your own copy of this sheet](https://docs.google.com/spreadsheets/d/1FvJf1Hf-kL_tF9Pcqhh2OpPn87UixvOY31N3sIXnvR4/edit?usp=sharing). Fill the tabs to fit your game. The actual order of the header titles doesn't matter.
- At the root of the project's folder, create a `config.json` file containing the following, with your own bot's values. Note that the ranges here are placeholders that fit the example sheet.
```
{
    "prefix": "your-chosen-prefix",
    "token": "your-token"
    "sheetID": "your-sheet's-id",
    "statsRange": "Stats!A1:N11"
}
```
- [Follow the Google Sheets API quickstart.](https://developers.google.com/sheets/api/quickstart/nodejs)
- (WIP)