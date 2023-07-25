const http = require('node:http');
const port = 9999;

const server = http.createServer((request, response) => {
  response.setHeader('Content-Type', 'text/plain');
  const headers = request.headers;
  let headersFormated = '';
  for (key in headers) {
    headersFormated += `${key}: ${headers[key]}\n`;
  }
  response.write(headersFormated);
  response.end();
});

server.listen(port);
