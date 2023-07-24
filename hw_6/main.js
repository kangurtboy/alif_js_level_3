const fs = require('node:fs');
const users = [
  '1, Vasya, +992000000001',
  '2, Petya, +992000000002',
  '3, Masha, +992000000003',
];

fs.writeFile(
  'export.txt',
  users
    .map((item) => {
      return item.split(',').map((sub) => sub.trim());
    })
    .join('\r\n'),
  function (err) {
    console.log(err);
  }
);