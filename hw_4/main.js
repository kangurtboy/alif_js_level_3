const fs = require('node:fs');
const content = fs.readFileSync('music.txt', 'utf-8');
const lines = content.split('\r\n');
const second = 2;
const parseHandle = function (item) {
  const music = {
    number: item.split('No:')[1][0],
    title: item.split('|')[1].split(':')[1].trim(),
    duration: item.split('|')[second].split('Duration:')[1].trim(),
  };
  console.log(music.number);
  console.log(music.title);
  console.log(music.duration);
};

lines.forEach(parseHandle);
