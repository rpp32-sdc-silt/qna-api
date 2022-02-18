const { Pool } = require('pg');
const { migrate } = require('postgres-migrations');
require('dotenv').config();

const poolConfig = {
  database: process.env.DATABASE,
  user: process.env.POSTGRES_USER,
  // password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  max: Number(process.env.DB_POOL_SIZE),
  idleTimeoutMillis: Number(process.env.DB_POOL_CLIENT_IDLE_TIMEOUT),
  connectionTimeoutMillis: Number(process.env.DB_POOL_CLIENT_CONNECTION_TIMEOUT),
}

const db = new Pool(poolConfig)

db.getQuestions = async function (productId, page, count) {
  let offset = 0;
  if (page !== '1') {
    offset = (page - 1) * count;
  };

  const query = `
    SELECT question_id, question_body, question_date, asker_name, question_helpfulness, reported,
    coalesce(
      (SELECT array_to_json(array_agg(row_to_json(x)))
        FROM (
          SELECT id, body, date, answerer_name, helpfulness,
          coalesce(
            (SELECT array_to_json(array_agg(url))
              FROM photos
              WHERE answers.id = photos.answer_id
            ), '[]'
          ) as photos
          FROM answers
          WHERE questions.question_id = answers.question_id
        ) x
      ), '[]'
    ) as answers
    FROM questions
    WHERE product_id = ${productId} limit ${count} OFFSET ${offset};`;

  let questions = await db.query(query);

  questions.rows.forEach(element => {
    let answersObject = {};
    element.answers.forEach(innerElem => {
      answersObject[innerElem.id] = innerElem
    })
    element.answers = answersObject;
  })

  questions = {
    'product_id': `${productId}`,
    'results': questions.rows
  }

  return questions;
}

db.getAnswers = async function (questionId, page, count) {
  let offset = 0;
  if (page !== '1') {
    offset = (page - 1) * count;
  };

  const query = `
    SELECT id AS answer_id, body, date, answerer_name, helpfulness,
    coalesce(
      (SELECT array_to_json(array_agg(row_to_json(x)))
        FROM (
          SELECT id, url
          FROM photos
          WHERE answers.id = photos.answer_id
        ) x
      ), '[]'
    ) as photos
    FROM answers
    WHERE question_id = ${questionId} limit ${count} OFFSET ${offset}`;

  let answers = await db.query(query);

  answers = {
    'question': `${questionId}`,
    'page': page,
    'count': count,
    'results': answers.rows
  };

  return answers
}

db.getPhotos = async function (answerId) {
  const query = `Select * From photos WHERE answer_id = ${answerId} limit 10;`
  const photos = await db.query(query);
  return photos.rows;
}

module.exports = { db };