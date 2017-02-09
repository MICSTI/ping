var winston = require('winston');

var LEVEL_CRITICAL = 'critical';
var LEVEL_WARNING = 'warning';

var checkConfig = function(site) {
    var messages = [];

    if (!site) {
        throw new Error('No site object parameter passed');
    }

    // check if config property is set
    if (!site.config) {
        messages.push(getMessageObject(LEVEL_CRITICAL, "Missing mandatory property 'config'"));
    } else {
        // check if request url is set
        if (!site.config.url) {
            messages.push(getMessageObject(LEVEL_CRITICAL, "Missing mandatory config property 'url'"));
        }

        // check if request method is set
        if (!site.config.method) {
            messages.push(getMessageObject(LEVEL_WARNING, "Config property 'method' for request method not set -> using default value 'GET'"));
        }

        // check if response type is set
        if (!site.config.type) {
            messages.push(getMessageObject(LEVEL_WARNING, "Config property 'type' for response type not set -> using default value 'json'"));
        }

        // check if response status is set
        if (!site.config.status) {
            messages.push(getMessageObject(LEVEL_WARNING, "Config property 'status' for response status not set -> using default value 200"));
        }

        // check if request body is set if method is 'POST' or 'PUT'
        if (typeof site.config.method === 'string' && ['POST', 'PUT'].indexOf(site.config.method.toLocaleUpperCase()) >= 0 && !site.config.body) {
            messages.push(getMessageObject(LEVEL_WARNING, "Config property 'body' for request body not set in POST or PUT request method"));
        }

        // check if request body is set if method is 'GET'
        if (typeof site.config.method === 'string' && site.config.method.toLocaleUpperCase() === 'GET') {
            messages.push(getMessageObject(LEVEL_WARNING, "Config property 'body' is set although request method is set to 'GET'"));
        }
    }

    return messages;
};

var getMessageObject = function(type, text) {
    return {
        type: type,
        message: text
    };
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports.checkConfig = checkConfig;
    module.exports.getMessageObject = getMessageObject;
    module.exports.LEVEL_CRITICAL = LEVEL_CRITICAL;
    module.exports.LEVEL_WARNING = LEVEL_WARNING;
}