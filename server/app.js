const server = require('./server.js');
const { db } = require('../database/index.js');
// require('newrelic');

const runningApp = server(db);