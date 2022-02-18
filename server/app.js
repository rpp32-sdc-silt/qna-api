const server = require('./server.js');
const { db } = require('../database/index.js');

const runningApp = server(db);