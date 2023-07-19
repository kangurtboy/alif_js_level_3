const os = require('node:os');

const userInfo = os.userInfo();
const userName = userInfo.username;
console.log(userName);
