const http = require('node:http');
const fs = require('node:fs');
const port = 9999;
const firstPart = 0;
const secondPart = 1;
const favicon = '/favicon.ico';
const notFound = 404;

const server = http.createServer((request, response) => {
  const url = request.url.trim().split('\n');

  if (request.url !== favicon) {
    const image = url[firstPart].slice(secondPart);
    let imageType = image.split('.')[secondPart];
    fs.readFile(image, (err, data) => {
      if (imageType === 'jpg') {
        imageType = 'jpeg';
      }
      if (data) {
        response.setHeader('Content-Type', 'image/' + imageType);
        response.end(data);
      } else {
        response.writeHead(notFound, err.message);
        response.end();
      }
    });
  }
});

server.listen(port);
