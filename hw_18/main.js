'use strict';
import pg from 'pg';
import express, { response } from 'express';
import cors from 'cors';

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

const path = '/api/posts';

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

const app = express();
app.use(cors());
app.use(express.json());

app.get(`${path}/:id`, async (request, response) => {
  //Получение поста по id
  const id = Number(request.params.id);
  if (isNaN(id) || id === null) {
    sendResponse.bad(response);
    return;
  }
  console.log(id);

  const findedPost = await pool.query(
    `SELECT id , content , removed , created FROM posts WHERE id = ${id} AND removed = FALSE;`
  );
  if (!findedPost.rows[0]) {
    sendResponse.notFound(response);
    return;
  }
  sendResponse.ok(response);
  response.end(JSON.stringify(findedPost.rows[0]));
});

app.get(`${path}/`, async (request, response) => {
  //Получение всех постов
  sendResponse.ok(response);

  const actualPosts = await pool.query(`SELECT id,
  content,
removed ,
  created
FROM posts WHERE removed = FALSE;`);

  response.end(JSON.stringify(actualPosts.rows.reverse()));
});

app.post(`${path}`, async (request, response) => {
  //Добавление поста
  const { content } = request.body;

  if (!content) {
    sendResponse.bad(response);
    return;
  }

  const newPostQuery = await pool.query(
    `INSERT INTO posts ( content)
	VALUES ('${content}') RETURNING id , content , removed , created;`
  );
  response.send(newPostQuery.rows[0]);
});

app.put(`${path}/:id`, async (request, response) => {
  //Редактирование поста
  const { content } = request.body;

  const id = Number(request.params.id);
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

  response.send(findedPost.rows[0]);
});

app.delete(`${path}/:id`, async (request, response) => {
  //   //Удаление поста

  const { content } = request.body;

  const id = Number(request.params.id);
  const url = new URL(request.url, `http://${request.headers.host}`);
  const { searchParams } = url;
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

  response.send(findedPost.rows[0]);
});

app.listen(port);
