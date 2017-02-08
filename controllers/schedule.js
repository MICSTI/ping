var schedule = require('node-schedule');
var Site = require('../models/site');
var mailer = require('./mailer');

var scheduleChecks = function() {
    schedule.scheduleJob('*/1 * * * *', function() {
        Site.find({
            active: true
        }, function(err, sites) {
            if (err) {
                console.error('failed to fetch sites from database');
            }

            sites.forEach(function(site) {
                // TODO perform check for site (if lastChecked and set interval are ok)

                // TODO update statistics for site object in database
            });
        });
    });

    console.log('--- scheduled checks ---');
};

module.exports.scheduleChecks = scheduleChecks;