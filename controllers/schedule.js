var schedule = require('node-schedule');
var request = require('request');
var winston = require('winston');

var Site = require('../models/site');
var mailer = require('./mailer');

var scheduleChecks = function() {
    schedule.scheduleJob('*/1 * * * *', function() {
        Site.find({
            active: true
        }, function(err, sites) {
            if (err) {
                winston.error('Failed to fetch sites from database', {
                   error: err
                });
            }

            sites.forEach(function(site) {
                // TODO perform check for site (if lastChecked and set interval are ok)

                // TODO update statistics for site object in database
            });
        });
    });

    winston.info('Scheduled checks');
};

var checkSite = function(site) {
    return new Promise(function(resolve, reject) {

    });
};

module.exports.scheduleChecks = scheduleChecks;