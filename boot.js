var cluster = require("cluster");
var numCpus = require("os").cpus().length;
var schedule = require('./controllers/schedule');
var logger = require('./log');

// config files ====================================
var SERVER = require("./config/server");

// set environment variable if it is not set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// log environment
logger.info('Environment is %s', process.env.NODE_ENV);

// set up cluster
/*cluster.setupMaster({ exec: __dirname + "/server.js" });

for (var i = 0; i < numCpus; i++) {
    cluster.fork();
}*/

// set up scheduled jobs
schedule.scheduleChecks();

require('./server');