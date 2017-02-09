var schedule = require('./controllers/schedule');
var logger = require('./log');

// config files ====================================
var SERVER = require("./config/server");

// set environment variable if it is not set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// log environment
logger.info('Environment is %s', process.env.NODE_ENV);

// set up scheduled jobs
schedule.scheduleChecks();

// start server
require('./server');