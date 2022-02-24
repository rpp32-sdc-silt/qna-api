const request = require('supertest');
const app = require('../server/server.js');
const { db } = require('../database/testIndex.js');

const mockServer = app(db);

describe('Sample Test', () => {
  it('should test that true === true', () => {
    expect(true).toBe(true);
  });
});

describe('GET /', () => {
  describe('Arriving at default/home page', () => {
    test('Should respond with a 200 status code', async () => {
        const response = await request(mockServer).get('/')
        expect (response.statusCode).toBe(200);
    });
  });
});

describe('GET /qa/questions', () => {
  describe('Given product ID', () => {
    test('Should respond with a 200 status code', async () => {
      const response = await request(mockServer)
      .get('/qa/questions?product_id=1')
      .send({
        page: 1,
        count: 1
      });
      expect (response.statusCode).toBe(200);
    });
  });
  describe('Given count and/or page', () => {
    test('Should respond back with 1 question when Page and Count set to 1', async () => {
      const response = await request(mockServer)
      .get('/qa/questions?product_id=1')
      .send({
        page: 1,
        count: 1
      });
      expect (response.body.results.length).toBe(1);
    });
    test('Should respond back with 5 questions when count is not provided', async () => {
      const response = await request(mockServer)
      .get('/qa/questions?product_id=1')
      .send({
        page: 1
      });
      expect (response.body.results.length).toBe(5);
    });
  });
  describe('Given incorrect or no product ID', () => {
    test('Should respond with a 400 status code if a product ID is not supplied', async () => {
      const response = await request(mockServer)
      .get('/qa/questions?product_id=')
      .send({
        page: 1,
        count: 1
      });
      expect (response.statusCode).toBe(404);
    });
    test('Should respond with a 400 status code if a incorrect product ID is supplied', async () => {
      const response = await request(mockServer)
      .get('/qa/questions?product_id=test')
      .send({
        page: 1,
        count: 1
      });
      expect (response.statusCode).toBe(404);
    });
  });
});

describe('POST /qa/questions', () => {
  describe('Given product ID ', () => {
    test('Should respond with a 201 status code on a successful post', async () => {
      const response = await request(mockServer)
      .post('/qa/questions')
      .send({
        product_id: 1,
        body: 'this is a test',
        name: 'tester name',
        email: 'tester email'
      });
      expect (response.statusCode).toBe(201);
    });
  });
  describe('Given no product ID ', () => {
    test('Should respond with a 404 status code on a failed post', async () => {
      const response = await request(mockServer)
      .post('/qa/questions')
      .send({
        body: 'this is a test',
        name: 'tester name',
        email: 'tester email'
      });
      expect (response.statusCode).toBe(404);
    });
  });
});

describe('PUT /qa/questions/:question_id/helpful', () => {
  describe('Given question ID ', () => {
    test('Should respond with a 204 status code on a successful update to "helpful"', async () => {
      const response = await request(mockServer)
      .put('/qa/questions/1/helpful')
      expect (response.statusCode).toBe(204);
    });
  });
  describe('Given an incorrect question ID ', () => {
    test('Should respond with a 404 status code on a failed update to "helpful"', async () => {
      const response = await request(mockServer)
      .put('/qa/questions/test/helpful')
      expect (response.statusCode).toBe(404);
    });
  });
});

describe('PUT /qa/questions/:question_id/report', () => {
  describe('Given question ID ', () => {
    test('Should respond with a 204 status code on a successful update to "reported"', async () => {
        const response = await request(mockServer)
        .put('/qa/questions/1/report')
        expect (response.statusCode).toBe(204);
    });
  });
  describe('Given an incorrect question Id', () => {
    test('Should respond with a 404 status code on a failed update to "reported"', async () => {
      const response = await request(mockServer)
      .put('/qa/questions/test/report')
      expect (response.statusCode).toBe(404);
    });
  });
});

describe('GET /qa/questions/:question_id/answers', () => {
  describe('Given question ID', () => {
    test('Should respond with a 200 status code', async () => {
      const response = await request(mockServer)
      .get('/qa/questions/1/answers')
      .send({
        page: 1,
        count: 1
      });
      expect (response.statusCode).toBe(200);
    });
  });
  describe('Given count or page', () => {
    test('Should respond back with 5 answers by default when count is not provided', async () => {
      const response = await request(mockServer)
      .get('/qa/questions/1/answers')
      .send({
        page: 1
      });
      expect (response.body.results.length).toBe(5);
    });
    test('Should respond back with answers from page 1 by default when page is not provided', async () => {
      const response = await request(mockServer)
      .get('/qa/questions/1/answers')
      .send({
        count: 1
      });
      expect (response.body.page).toBe(1);
    });
  });
  describe('Given incorrect question ID', () => {
    test('Should respond with a 404 status code', async () => {
      const response = await request(mockServer)
      .get('/qa/questions/test/answers')
      .send({
        page: 1,
        count: 1
      });
      expect (response.statusCode).toBe(404);
    });
  });
});

describe('POST /qa/questions/:question_id/answers', () => {
  describe('Given question ID, message, name, email, and photo(s) URL', () => {
    test('Should respond with a 201 status code on a successful post', async () => {
      const response = await request(mockServer)
      .post('/qa/questions/1/answers')
      .send({
      body: 'this is a test',
      name: 'tester name',
      email: 'tester email',
      photos: 'www.somePhotoURL.com'
      });
      expect (response.status).toBe(201);
    });
  });
  describe(`Given multiple photo URL's`, () => {
    test('Should respond with a 201 status code on a successful post', async () => {
      const response = await request(mockServer)
      .post('/qa/questions/1/answers')
      .send({
      body: 'this is a test',
      name: 'tester name',
      email: 'tester email',
      photos: ['www.somePhotoURL.com', 'www.anothersomePhotoURL.com']
      });
      expect (response.status).toBe(201);
    });
  });
  describe('Given missing question ID, message, name, email, and/or photo(s) URL', () => {
    test('Should respond with a 404 status code when question ID does not exist', async () => {
      const response = await request(mockServer)
      .post('/qa/questions/test/answers')
      .send({
      body: 'this is a test',
      name: 'tester name',
      email: 'tester email',
      photos: 'www.somePhotoURL.com'
      });
      expect (response.status).toBe(404);
    });
    test('Should respond with a 404 status code when message is not provided', async () => {
      const response = await request(mockServer)
      .post('/qa/questions/1/answers')
      .send({
      name: 'tester name',
      email: 'tester email',
      photos: 'www.somePhotoURL.com'
      });
      expect (response.status).toBe(404);
    });
  });
});

describe('PUT /qa/answers/:answer_id/helpful', () => {
  describe('Given answer ID ', () => {
    test('Should respond with a 204 status code on a successful update to "helpful"', async () => {
      const response = await request(mockServer)
      .put('/qa/answers/1/helpful')
      expect (response.statusCode).toBe(204);
    });
  });
  describe('Given product ID ', () => {
    test('Should respond with a 404 status code on a failed update to "helpful"', async () => {
      const response = await request(mockServer)
      .put('/qa/answers/test/helpful')
      expect (response.statusCode).toBe(404);
    });
  });
});

describe('PUT /qa/answers/:answer_id/report', () => {
  describe('Given answer ID ', () => {
    test('Should respond with a 204 status code on a successful update to "reported"', async () => {
        const response = await request(mockServer)
        .put('/qa/answers/1/report')
        expect (response.statusCode).toBe(204);
    });
  });
  describe('Given an incorrect answer Id', () => {
    test('Should respond with a 404 status code on a failed update to "reported"', async () => {
      const response = await request(mockServer)
      .put('/qa/answers/test/report')
      expect (response.statusCode).toBe(404);
    });
  });
});