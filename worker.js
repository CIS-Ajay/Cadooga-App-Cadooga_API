// worker.js
require('dotenv').config();
const djangoQueue = require('./queues/djangoQueue');

console.log("Django queue worker started...");
