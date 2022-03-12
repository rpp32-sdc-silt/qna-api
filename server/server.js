// require('newrelic');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Redis = require('redis');


module.exports = function async (db) {
  const app = express();

  let redisClient;
  (async () => {
    redisClient = Redis.createClient();
    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    await redisClient.connect();
  })();

  app.use(express.static('public'));
  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.listen(8080, () => {
    console.log('Listening on Port 8080');
  });

  app.get('/', (req, res) => {
    res.status(200).send('Welcome!');
  });

  app.get('/qa/questions', async (req, res) => {
    try {
      const prodId = req.query.product_id;
      let questions = await redisClient.get(`${prodId}`);
      questions = JSON.parse(questions);
      if (!questions) {
        questions = await db.getQuestions(req.query.product_id, (req.body.page || 1), (req.body.count || 5));
        redisClient.set(`P${prodId}`, JSON.stringify(questions));
      }
      res.status(200).json(questions);
    } catch (err) {
      res.status(404).send(err.message);
    }
  });

  app.post('/qa/questions', async (req, res) => {
    try {
      await db.addQuestion(req.body)
      res.status(201).send('CREATED');
    } catch (err) {
      res.status(404).send(err.message);
    }
  });

  app.put('/qa/questions/:question_id/helpful', async (req, res) => {
    try {
      await db.updateQuestionHelpfulness(req.params.question_id);
      res.status(204).send('NO CONTENT');
    } catch (err) {
      res.status(404).send(err.message);
    }
  });

  app.put('/qa/questions/:question_id/report', async (req, res) => {
    try {
      await db.updateQuestionReported(req.params.question_id);
      res.status(204).send('NO CONTENT');
    } catch (err) {
      res.status(404).send(err.message);
    }
  })

  app.get('/qa/questions/:question_id/answers', async (req, res) => {
    try {
      const questionId = req.params.question_id;
      let answers = await redisClient.get(`${questionId}`);
      answers = JSON.parse(answers);
      if(!answers) {
        answers = await db.getAnswers(req.params.question_id, (req.body.page || 1), (req.body.count || 5));
        redisClient.set(`Q${questionId}`, JSON.stringify(answers));
      }
      res.status(200).send(answers);
    } catch (err) {
      res.status(404).send(err.message);
    }
  });

  app.post('/qa/questions/:question_id/answers', async (req, res) => {
    try{
      if (req.body.body && req.body.name && req.body.email) {
        await db.addAnswer(req.params.question_id, req.body);
        if(req.body.photos) {
          await db.addPhoto(req.body);
        }
        res.status(201).send('CREATED');
      } else {
        res.status(404).send('Request body missing paramenter(s)')
      }
    } catch (err) {
      res.status(404).send(err.message);
    }
  });

  app.put('/qa/answers/:answer_id/helpful', async (req, res) => {
    try {
      await db.updateAnswerHelpfulness(req.params.answer_id);
      res.status(204).send('NO CONTENT');
    } catch (err) {
      res.status(404).send(err.message);
    }
  });

  app.put('/qa/answers/:answer_id/report', async (req, res) => {
    console.log(req.params.answer_id)
    try {
      await db.updateAnswersReported(req.params.answer_id);
      res.status(204).send('NO CONTENT');
    } catch (err) {
      res.status(404).send(err.message);
    }
  })

  return app;
}
