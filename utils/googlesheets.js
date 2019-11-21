function columnNumberToLetter(column)
{
  var temp, letter = '';
  while (column > 0)
  {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

function letterToColumnNumber(letter)
{
  var column = 0, length = letter.length;
  for (var i = 0; i < length; i++)
  {
    column += (letter.toUpperCase().charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
  }
  return column;
}

console.log(letterToColumnNumber('AA'));
console.log(columnNumberToLetter(27));
