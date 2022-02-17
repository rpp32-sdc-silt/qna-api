const db = require('./database/database.pg.js')
const fs = require('fs');
const fastcsv = require('fast-csv');
const csv = require('csv-parser');
const { parse } = require('csv-parse');

// var data = '';
// var dataArr = [];

// var readerStream = fs.createReadStream('./data/test.csv')

// readerStream.setEncoding('UTF8');

// readerStream.on('data', function(chunk) {
//   console.log(chunk)
//   // dataArr = chunk.split('\n');
//   // dataArr.forEach(element => {
//   //   console.log(element.split(','))
//   })
//   // var testDataArr = dataArr[1].split(',');
//   // console.log('dataArr', testDataArr);
//   // db.client.query(`INSERT INTO Questions (id) Values (${dataArr[0][0]})`, (err, res) => {
//   //   if (!err) {
//   //     console.log('success!');
//   //   } else {
//   //     console.log(err.message);
//   //   }
//   //   db.client.end;
//   // });
// // });

// readerStream.on('end', function() {
//   console.log('data');
// });

// readerStream.on('error', function(err) {
//   console.log(err.stack);
// });

// console.log('Program Ended');

const storeInQuestions = async (obj) => {
  const query = `INSERT INTO Questions VALUES (${obj.id}, ${obj.product_id}, '${obj.body}', ${obj.date_written},
    '${obj.asker_name}', '${obj.asker_email}', ${Boolean(obj.reported)}, ${obj.helpful});`;
  // const query = `INSERT INTO Questions (id) VALUES (${array[0]});`;
  await db.client.query(query, (err, res) => {
    if (!err) {
      console.log('success!');
    } else {
      console.log(err.message);
    }
    db.client.end;
  });
}

var batch = [];
var counter = 0;

var rs = fs.createReadStream('./data/questions.csv')
.pipe(csv({}))
.on('data', function(data) {
  batch.push(data)
  counter ++;

  if (counter > 100) {
    rs.pause();
    // setTimeout(() => {
      batch.map(element => {
        if (element.id !== 'id') {
          storeInQuestions(element);
        }
      })
      counter = 0;
      batch = [];
      rs.resume();
    // }, 7000);
  }
})
.on('end', function() {
  console.log('FINISHED!');
  // results.map(element => {
  //   storeInQuestions(element);
  // })
})



