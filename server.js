// modules ====================================
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var logger = require('winston');

var authentication = require('./controllers/authentication');
var errorHandler = require('./controllers/error-handler');
var favicon = require('serve-favicon');
var path = require("path");

// config files ====================================
var SERVER = require("./config/server");

// set port
var port = process.env.PORT || SERVER.port;

// get all data of the body (POST) parameters
app.use(bodyParser.json());

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse JWT token
app.use(authentication);

// favicon
app.use(favicon(__dirname + '/assets/favicon.ico'));

// routes ====================================
app.use('/api', require('./controllers/api/server-auth.js'));
app.use('/api/password', require('./controllers/api/password.js'));
app.use('/api/sites', require('./controllers/api/sites.js'));
app.use('/api/users', require('./controllers/api/users.js'));

// set the static files location
app.use("/public", express.static("public"));
app.use("/build", express.static("build"));

// server routes ================================================
// index
app.get("/", function(req, res) {
    res.sendFile(path.resolve('build/views/index.html'));
});

// 404
app.get("*", function(req, res) {
    res.status(404).send("This is not an allowed URL");
});

// error handler ====================================
app.use(errorHandler);

// start app ====================================
app.listen(port);

// console message
logger.info("ping started on port %d", port);

// expose app
exports = module.exports = app;