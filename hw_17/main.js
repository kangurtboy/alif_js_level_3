'use strict';
import http from 'node:http';
import pg from 'pg';
const posts = [
  //   { id: 0, content: 'bla', created: Date.now(), removed: false },
  //   { id: 1, content: 'bla', created: Date.now(), removed: false },
  //   { id: 2, content: 'bla', created: Date.now(), removed: false },
];
const connetionString = 'postgres://app:pass@localhost:5432/db';
const pool = new pg.Pool({
  connectionString: connetionString,
});

pool.on('connect', () => {
  console.log('connect succsess!');
});
pool.on('error', (err) => {
  console.log(err);
});

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

methods.set(`${path}.post`, async function (request, response) {
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
  const newPostQuery = await pool.query(
    `INSERT INTO posts ( content)
	VALUES ('${post.content}') RETURNING id , content , removed , created;`
  );
  sendResponse.ok(response);
  response.end(JSON.stringify(newPostQuery.rows[0]));
  posts.unshift(post);
});

methods.set(`${path}.edit`, async function (request, response) {
  //Редактирование поста
  const url = new URL(request.url, `http://${request.headers.host}`);
  const { searchParams } = url;
  const content = searchParams.get('content');
  const id = Number(searchParams.get('id'));
  if (!content || !id) {
    sendResponse.bad(response);
    return;
  }

  const findedPost = await pool.query(
    `UPDATE posts SET content = '${content}'  WHERE id = ${id} AND removed = FALSE RETURNING id , content , removed , created;`
  );

  if (!findedPost.rows[0]) {
    sendResponse.notFound(response);
    return;
  }


  sendResponse.ok(response);
  response.end(JSON.stringify(findedPost.rows[0]));
});

methods.set(`${path}.get`, async function (request, response) {
  //Получение всех постов
  sendResponse.ok(response);

  const actualPosts = await pool.query(`SELECT id,
  content,
removed ,
  created
FROM posts WHERE removed = FALSE;`);


  response.end(JSON.stringify(actualPosts.rows.reverse()));
});

methods.set(`${path}.delete`, async function (request, response) {
  //Удаление поста
  const url = new URL(request.url, `http://${request.headers.host}`);
  const { searchParams } = url;
  const id = Number(searchParams.get('id'));
  if (!id) {
    sendResponse.bad(response);
    return;
  }

  const findedPost = await pool.query(
    `UPDATE posts SET removed = TRUE  WHERE id = ${id} AND removed = FALSE RETURNING id , content , removed , created;`
  );

  if (!findedPost.rows[0]) {
    sendResponse.notFound(response);
    return;
  }

  sendResponse.ok(response);


  response.end(JSON.stringify(findedPost.rows[0]));
});

methods.set(`${path}.restore`, async function (request, response) {
  //Востановление удаленного поста
  const url = new URL(request.url, `http://${request.headers.host}`);
  const { searchParams } = url;
  const id = Number(searchParams.get('id'));


  if (!id) {
    sendResponse.bad(response);
    response.end();
    return;
  }
  const findedPost = await pool.query(
    `UPDATE posts SET removed = FALSE  WHERE id = ${id} AND removed = TRUE RETURNING id , content , removed , created;`
  );


  if (!findedPost.rows[0]) {
    sendResponse.notFound(response);
    response.end();
    return;
  }

  //findedPost.removed = false;
  sendResponse.ok(response);
  response.end(JSON.stringify(findedPost.rows[0]));
});

methods.set(`${path}.getById`, async function (request, response) {
  //Получение поста по id
  const url = new URL(request.url, `http://${request.headers.host}`);
  const id = Number(url.searchParams.get('id'));
  if (isNaN(id) || id === null) {
    sendResponse.bad(response);
    return;
  }


  const findedPost = await pool.query(
    `SELECT id , content , removed , created FROM posts WHERE id = ${id} AND removed = FALSE`
  );

  if (!findedPost.rows[0]) {
    sendResponse.notFound(response);
    return;
  }
  sendResponse.ok(response);
  response.end(JSON.stringify(findedPost.rows[0]));
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
