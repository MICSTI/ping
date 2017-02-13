var schedule = require('node-schedule');
var request = require('request');
var winston = require('winston');

var Site = require('../models/site');
var mailer = require('./mailer');

var scheduleChecks = function() {
    schedule.scheduleJob('*/1 * * * *', function() {
        winston.info('Started check');

        Site.find({
            active: true
        }, function(err, sites) {
            if (err) {
                winston.error('Failed to fetch sites from database', {
                   error: err
                });
            }

            sites.forEach(function(site) {
                // TODO check if site is propertly configured

                // TODO perform check for site (if lastChecked and set interval are ok)

                // perform request
                console.log('requesting', getRequestUrl(site));

                request.get(getRequestUrl(site), function(error, response, body) {
                    if (error) {
                        // do something with error
                        return winston.info('Site %s reponded with an error', site.name, {
                            error: error,
                            response: response,
                            body: body
                        });
                    }

                    var statusCode = response.statusCode;

                    winston.info('Site %s responded with a status %d', site.name, statusCode);
                });

                // TODO update statistics for site object in database
            });
        });
    });

    winston.info('Scheduled checks');
};

var getRequestUrl = function(site) {
    if (site && site.config && site.config.settings && site.config.settings.addRandomParameter !== undefined) {
        var url = site.config.url;

        if (site.config.settings.addRandomParameter === true) {
            // check if there are already query params appended to the URL
            if (url.indexOf('?') >= 0) {
                return url + "&randomPing=" + Math.random();
            } else {
                return url + "?randomPing=" + Math.random();
            }
        }
    }

    return site.config.url;
};

var checkSite = function(site) {
    return new Promise(function(resolve, reject) {

    });
};

module.exports.scheduleChecks = scheduleChecks;