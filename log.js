var logger = require('winston');

// config files ====================================
var SERVER = require("./config/server");

// set up logging
var logLevel = process.env.LOG_LEVEL || SERVER.log.level;

logger.level = logLevel;

// set additional transport to log to file
logger.add(logger.transports.File, { filename: 'logs/ping.log' });

// remove console logging in production mode
if (process.env.NODE_ENV === 'production') {
    logger.remove(logger.transports.Console);
}

module.exports = logger;