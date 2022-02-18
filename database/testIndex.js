const { Pool } = require('pg');
const { migrate } = require('postgres-migrations');

const poolConfig = {
  database: testDb,
  user: postgres,
  // password: process.env.DB_PASSWORD,
  host: 'postgres',
  port: 5432
}

const db = new Pool(poolConfig)

db.getQuestions = async function (productId) {
  const query = `SELECT * From questions WHERE product_id = ${productId} limit 100;`
  const questions = await db.query(query);
  return questions.rows;
}

db.getAnswers = async function (questionId) {
  const query = `SELECT * FROM answers WHERE question_id = ${questionId} limit 10;`
  const answers = await db.query(query);
  return answers.rows;
}

db.getPhotos = async function (answerId) {
  const query = `Select * From photos WHERE answer_id = ${answerId} limit 10;`
  const photos = await db.query(query);
  return photos.rows;
}

module.exports = { db };