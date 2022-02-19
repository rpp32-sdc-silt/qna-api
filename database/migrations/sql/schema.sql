DROP DATABASE qna_db;
CREATE DATABASE qna_db;

\c qna_db

DROP table IF EXISTS products, questions, answers, photos;

CREATE TABLE products(
  id integer primary key
);

CREATE TABLE questions(
  question_id serial primary key,
  product_id integer NOT NULL,
  question_body VARCHAR(255) NOT NULL,
  epoch BIGINT NOT NULL,
  asker_name VARCHAR(255) NOT NULL,
  asker_email VARCHAR(255) NOT NULL,
  reported BOOLEAN,
  question_helpfulness integer NOT NULL,
  question_date TIMESTAMP NULL DEFAULT NULL
);


COPY questions (question_id, product_id, question_body, epoch, asker_name, asker_email, reported, question_helpfulness) FROM '/Users/ash/Documents/RPP32/FEC-Project/qna-api/data/questions.csv' Delimiter ',' csv header;
UPDATE questions SET question_date = to_timestamp(floor(epoch/1000));
ALTER TABLE questions DROP COLUMN epoch;
SELECT setval(pg_get_serial_sequence('questions', 'question_id'), coalesce(max(question_id)+1, 1), false) FROM questions;

CREATE TABLE answers(
  id integer primary key,
  question_id serial NOT NULL,
  body VARCHAR(255) NOT NULL,
  epoch BIGINT NOT NULL,
  answerer_name VARCHAR(255) NOT NULL,
  answerer_email VARCHAR(255) NOT NULL,
  reported BOOLEAN,
  helpfulness VARCHAR(255),
  date TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_question
    FOREIGN KEY (question_id) references questions(question_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

COPY answers (id, question_id, body, epoch, answerer_name, answerer_email, reported, helpfulness) FROM '/Users/ash/Documents/RPP32/FEC-Project/qna-api/data/answers.csv' Delimiter ',' csv header;
UPDATE answers SET date = to_timestamp(floor(epoch/1000));
ALTER TABLE answers DROP COLUMN epoch;
SELECT setval(pg_get_serial_sequence('answers', 'id'), coalesce(max(id)+1, 1), false) FROM answers;

CREATE TABLE photos (
  id integer primary key,
  answer_id integer NOT NULL,
  url VARCHAR(2083) NOT NULL,
  CONSTRAINT fk_answer
    FOREIGN KEY (answer_id) references answers(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

COPY photos FROM '/Users/ash/Documents/RPP32/FEC-Project/qna-api/data/photos.csv' Delimiter ',' csv header;
SELECT setval(pg_get_serial_sequence('photos', 'id'), coalesce(max(id)+1, 1), false) FROM photos;