DROP DATABASE testdb;
CREATE DATABASE testdb;

\c testdb;

DROP table IF EXISTS products, questions, answers, photos;

CREATE TABLE products(
  id integer primary key
);

CREATE TABLE questions(
  id serial primary key,
  product_id integer NOT NULL,
  body VARCHAR(255) NOT NULL,
  epoch BIGINT NOT NULL,
  asker_name VARCHAR(255) NOT NULL,
  asker_email VARCHAR(255) NOT NULL,
  reported BOOLEAN,
  helpful VARCHAR(255),
  date_written TIMESTAMP NULL DEFAULT NULL
);


COPY questions (id, product_id, body, epoch, asker_name, asker_email, reported, helpful) FROM '/Users/ash/Documents/RPP32/FEC-Project/qna-api/data/testQuestions.csv' Delimiter ',' csv header;
UPDATE questions SET date_written = to_timestamp(floor(epoch/1000));
ALTER TABLE questions DROP COLUMN epoch;

CREATE TABLE answers(
  id integer primary key,
  question_id serial NOT NULL,
  body VARCHAR(255) NOT NULL,
  epoch BIGINT NOT NULL,
  answerer_name VARCHAR(255) NOT NULL,
  answerer_email VARCHAR(255) NOT NULL,
  reported BOOLEAN,
  helpful VARCHAR(255),
  date_written TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_question
    FOREIGN KEY (question_id) references questions(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

COPY answers (id, question_id, body, epoch, answerer_name, answerer_email, reported, helpful) FROM '/Users/ash/Documents/RPP32/FEC-Project/qna-api/data/testAnswers.csv' Delimiter ',' csv header;
UPDATE answers SET date_written = to_timestamp(floor(epoch/1000));
ALTER TABLE answers DROP COLUMN epoch;

CREATE TABLE photos (
  id integer primary key,
  answer_id integer NOT NULL,
  url VARCHAR(2083) NOT NULL,
  CONSTRAINT fk_answer
    FOREIGN KEY (answer_id) references answers(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

COPY photos FROM '/Users/ash/Documents/RPP32/FEC-Project/qna-api/data/testPhotos.csv' Delimiter ',' csv header;