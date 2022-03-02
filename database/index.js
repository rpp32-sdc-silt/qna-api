const { Pool } = require('pg');
require('dotenv').config();
const format = require('pg-format');
const { migrate } = require('postgres-migrations');

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

db.connect(function(err) {
  if (err) {
    console.log(err);
  }
})

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
};

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
};

db.addQuestion = async function (requestBody) {
  const query = `
    INSERT INTO questions (product_id, question_body, asker_name, asker_email, reported, question_date, question_helpfulness)
    VALUES (${requestBody.product_id}, '${requestBody.body}', '${requestBody.name}', '${requestBody.email}', false, CURRENT_TIMESTAMP(0), 0)
    `;
  await db.query(query);
};

db.addAnswer = async function (questionId, requestBody) {
  const query = `
    INSERT INTO answers (question_id, body, date, answerer_name, answerer_email, reported, helpfulness)
    VALUES(${questionId}, '${requestBody.body}', CURRENT_TIMESTAMP(0), '${requestBody.name}', '${requestBody.email}', false, 0)
    RETURNING id
    `;
  await db.query(query);
};

db.addPhoto = async function (requestBody) {
  let photos = requestBody.photos
  // const query = format(`
  //   INSERT INTO photos (answer_id, url)
  //   VALUES (
  //     (SELECT MAX(id) FROM answers), %L
  //   )
  // `, requestBody.photos);
  if (Array.isArray(photos)) {
    for (const url of photos) {
      const query = `
        INSERT INTO photos (answer_id, url)
        VALUES (
          (SELECT MAX(id) FROM answers), '${url}')
          `;
        await db.query(query);
      };
    } else {
      const query = `
      INSERT INTO photos (answer_id, url)
      VAlUES (
        (SELECT MAX(id) FROM answers), '${photos}')
        `;
      await db.query(query);
  }
};

db.updateQuestionHelpfulness = async function (questionId) {
  const query = `
    UPDATE questions
    SET question_helpfulness = question_helpfulness + 1
    WHERE question_id = ${questionId}
  `
  await db.query(query);
};

db.updateAnswerHelpfulness = async function (answerId) {
  const query = `
    UPDATE answers
    SET helpfulness = helpfulness + 1
    WHERE id = ${answerId}
  `
  await db.query(query);
};

db.updateQuestionReported = async function (questionId) {
  const query = `
    UPDATE questions
    SET reported = true
    WHERE question_id = ${questionId}
  `
  await db.query(query);
}

db.updateAnswersReported = async function (answerId) {
  const query = `
    UPDATE answers
    SET reported = true
    WHERE id = ${answerId}
  `
  await db.query(query);
}

module.exports = { db };