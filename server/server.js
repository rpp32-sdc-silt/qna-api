const express = require('express');
const { connection } = require('../database/index.js');


module.exports = function (db) {
  const app = express();

  app.listen(3000, () => {
    console.log('Listening on Port 3000');
  });

  app.get('/', (req, res) => {
    // res.send(req.query.productId);
    // let query = 'Select * from questions limit 3'
    // db.connection.query(query, (err, res) => {
    //   if(!err) {
    //     console.log(res.rows);
    //   } else {
    //     console.log(err.message);
    //   }
    //   db.connection.end
    // })
    res.send('hello world!!')
  });

  app.get('/questions', async (req, res) => {
    try {
      const questions = await db.getQuestions(req.query.productId, (req.query.page || 1), (req.query.count || 5));
      res.send(questions);
    } catch (err) {
      res.status(404).send(err.message);
    }
  });

  app.get('/answers', async (req, res) => {
    try {
      const answers = await db.getAnswers(req.query.questionId, (req.query.page || 1), (req.query.count || 5));
      res.send(answers);
    } catch (err) {
      res.status(404).send(err.message);
    }
  });

  app.get('/photos', async (req, res) => {
    try {
      const photos = await db.getPhotos(req.query.answerId);
      res.send(photos);
    } catch (err) {
      res.status(404).send(err.message);
    }
  })

  return app;
}
