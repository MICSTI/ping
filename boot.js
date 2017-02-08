// set up cluster
var cluster = require("cluster");
var numCpus = require("os").cpus().length;

console.log('Environment:', process.env.NODE_ENV || 'development');

cluster.setupMaster({ exec: __dirname + "/server.js" });

for (var i = 0; i < numCpus; i++) {
    cluster.fork();
}

// set up scheduled jobs
var schedule = require('./controllers/schedule');

schedule.scheduleChecks();