'use strict';
const http = require('node:http');
const posts = [
  //   { id: 0, content: 'bla', created: Date.now(), removed: false },
  //   { id: 1, content: 'bla', created: Date.now(), removed: false },
  //   { id: 2, content: 'bla', created: Date.now(), removed: false },
];
const port = 9999;
const status = {
  //статусы ответа
  bad: 400,
  ok: 200,
  noteFound: 404,
};
let dynamicId = 0;
const path = '/posts';

const sendResponse = {
  //Отправка статусов
  bad(response) {
    response.writeHead(status.bad);
    response.end();
  },
  notFound(response) {
    response.writeHead(status.noteFound);
    response.end();
  },
  ok(response) {
    response.writeHead(status.ok, { 'Content-Type': 'application/json' });
  },
};

const methods = new Map();

methods.set(`${path}.post`, function (request, response) {
  //Добавление поста
  const url = new URL(request.url, `http://${request.headers.host}`);
  const { searchParams } = url;
  const content = searchParams.get('content');
  if (!content) {
    sendResponse.bad(response);
    return;
  }
  const post = {
    id: dynamicId++,
    content: content,
    created: Date.now(),
    removed: false,
  };
  sendResponse.ok(response);
  response.end(JSON.stringify(post));
  posts.unshift(post);
});

methods.set(`${path}.edit`, function (request, response) {
  //Редактирование поста
  const url = new URL(request.url, `http://${request.headers.host}`);
  const { searchParams } = url;
  const content = searchParams.get('content');
  const id = Number(searchParams.get('id'));
  if (!content || !id) {
    sendResponse.bad(response);
    return;
  }

  const findedPost = posts.find((el) => el.id === id);

  if (!findedPost || findedPost.removed) {
    sendResponse.notFound(response);
    return;
  }

  findedPost.content = content;

  sendResponse.ok(response);
  response.end(JSON.stringify(findedPost));
});

methods.set(`${path}.get`, function (request, response) {
  //Получение всех постов
  sendResponse.ok(response);
  const actualPosts = posts.filter((item) => item.removed === false);
  response.end(JSON.stringify(actualPosts));
});

methods.set(`${path}.delete`, function (request, response) {
  //Удаление поста
  const url = new URL(request.url, `http://${request.headers.host}`);
  const { searchParams } = url;
  const id = Number(searchParams.get('id'));
  if (!id) {
    sendResponse.bad(response);
    return;
  }

  const findedPost = posts.find((el) => el.id === id);

  if (!findedPost || findedPost.removed) {
    sendResponse.notFound(response);
    return;
  }

  sendResponse.ok(response);
  findedPost.removed = true;

  response.end(JSON.stringify(findedPost));
});

methods.set(`${path}.getById`, function (request, response) {
  //Получение поста по id
  const url = new URL(request.url, `http://${request.headers.host}`);
  const id = Number(url.searchParams.get('id'));
  if (isNaN(id) || id === null) {
    sendResponse.bad(response);
    return;
  }
  const findedPost = posts.find((el) => el.id === id);
  if (!findedPost || findedPost.removed) {
    sendResponse.notFound(response);
    return;
  }
  sendResponse.ok(response);
  response.end(JSON.stringify(findedPost));
});

const server = new http.createServer((request, response) => {
  //Сервер
  const url = new URL(request.url, `http://${request.headers.host}`);

  const method = methods.get(url.pathname);
  if (!method) {
    sendResponse.notFound(response);
    return;
  }
  method(request, response);
});
server.listen(port);
