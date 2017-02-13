var chai = require("chai");
var chaiHttp = require("chai-http");
var fs = require('fs');
var path = require('path');

var should = chai.should();
var expect = chai.expect;

chai.use(chaiHttp);

var Ping = require('../../controllers/ping');
var ConfigChecker = require('../../controllers/check-site-config');

// dummy test
describe('dummy test', function() {
    it('should be able to calculate', function() {
        expect(40 + 2).to.equal(42);
    });
});

// ping result checker
describe('ping result checker', function() {
    beforeEach(function() {
        ping = new Ping();
    });

    it('is an object', function() {
        expect(ping).to.be.an('object');
    });

    it('has a result method', function() {
        expect(ping.result).to.be.a('function');
    });

    it('rejects result call without parameters', function() {
        expect(ping.result).to.throw(Error);
    });

    it('rejects result call with invalid type parameter', function() {
        expect(ping.result.bind(undefined, { type: 'Dolores' })).to.throw(Error);
    });

    it('correctly checks a string result', function() {
        expect(ping.result({ type: 'String' }, 'Dolores')).to.be.true;
    });

    it('correctly checks a number result', function() {
        expect(ping.result({ type: 'Number' }, 42.42)).to.be.true;
    });

    it('correctly checks an object result', function() {
        expect(ping.result({ type: 'Object' }, { a: 'A' })).to.be.true;
    });

    it('correctly checks a boolean result', function() {
        expect(ping.result({ type: 'Boolean' }, false)).to.be.true;
    });

    it('correctly checks an object result', function() {
        expect(ping.result({ type: 'Object' }, { a: 'A' })).to.be.true;
    });

    it('correctly checks an undefined result', function() {
        expect(ping.result({ type: 'undefined' })).to.be.true;
        expect(ping.result({ type: 'undefined' }, undefined)).to.be.true;
    });

    it('correctly rejects a result with a wrong type', function() {
        expect(ping.result({ type: 'String' }, 8)).to.be.false;
    });

    it('correctly rejects an undefined result value', function() {
        expect(ping.result({ type: 'String' })).to.be.false;
        expect(ping.result({ type: 'boolean' })).to.be.false;
    });

    it('correctly checks an exact value', function() {
        expect(ping.result({ exact: 'Dolores' }, 'Dolores')).to.be.true;
        expect(ping.result({ exact: 42 }, 42)).to.be.true;
    });

    it('correctly rejects an incorrect exact value', function() {
        expect(ping.result({ exact: 'Dolores' }, 'Abernathy')).to.be.false;
        expect(ping.result({ exact: 'Dolores' }, 8)).to.be.false;
    });

    it('correctly checks a range value', function() {
        expect(ping.result({ range: { lower: 10 } }, 10)).to.be.true;
        expect(ping.result({ range: { higher: 43 } }, 42)).to.be.true;
        expect(ping.result({ range: { lower: 41, higher: 43 } }, 42)).to.be.true;
    });

    it('correctly rejects an incorrect range value', function() {
        expect(ping.result({ range: { lower: 10 } }, 8)).to.be.false;
        expect(ping.result({ range: { higher: 43 } }, 45)).to.be.false;
        expect(ping.result({ range: { lower: 41, higher: 43 } }, 40)).to.be.false;
    });

    it('correctly matches a regex', function() {
        expect(ping.result({ regex: "^[0-9]+\\.[0-9]+\\.[0-9]+$" }, "1.2.0")).to.be.true;
        expect(ping.result({ type: "String", regex: "^[0-9]+\\.[0-9]+\\.[0-9]+$" }, "1.2.0")).to.be.true;
    });

    it('correctly rejects an invalid regex', function() {
        expect(ping.result({ regex: "i am not cool" }, "1.2.0")).to.be.false;
        expect(ping.result.bind(undefined, { type: 'Number', regex: "^[0-9]+" }, "1.2.0")).to.throw(Error);
    });
});

describe('site configuration checker', function() {
    it('throws an error if no input is supplied', function() {
        expect(ConfigChecker.checkConfig).to.throw(Error);
    });

    it('returns an array', function() {
        expect(ConfigChecker.checkConfig({})).to.be.an.array;
    });

    it('critically warns about missing config object', function() {
        expect(ConfigChecker.checkConfig({

        })).to.deep.include(ConfigChecker.getMessageObject(ConfigChecker.LEVEL_CRITICAL, "Missing mandatory property 'config'"));
    });

    it('critically warns about missing request URL', function() {
        expect(ConfigChecker.checkConfig({
            config: {}
        })).to.deep.include(ConfigChecker.getMessageObject(ConfigChecker.LEVEL_CRITICAL, "Missing mandatory config property 'url'"));
    });

    it('critically warns about invalid request methods', function() {
        expect(ConfigChecker.checkConfig({
            config: {
                method: 'click'
            }
        })).to.deep.include(ConfigChecker.getMessageObject(ConfigChecker.LEVEL_CRITICAL, "Invalid request method -> allowed options are: 'GET', 'POST', 'PUT' or 'DELETE'"));

        expect(ConfigChecker.checkConfig({
            config: {
                method: 'delete'
            }
        })).to.not.deep.include(ConfigChecker.getMessageObject(ConfigChecker.LEVEL_CRITICAL, "Invalid request method -> allowed options are: 'GET', 'POST', 'PUT' or 'DELETE'"));
    });

    it('warns about missing request method', function() {
        expect(ConfigChecker.checkConfig({
            config: {}
        })).to.deep.include(ConfigChecker.getMessageObject(ConfigChecker.LEVEL_WARNING, "Config property 'type' for response type not set -> using default value 'json'"));
    });

    it('warns about missing response status', function() {
        expect(ConfigChecker.checkConfig({
            config: {}
        })).to.deep.include(ConfigChecker.getMessageObject(ConfigChecker.LEVEL_WARNING, "Config property 'status' for response status not set -> using default value 200"));
    });

    it('warns about missing response type', function() {
        expect(ConfigChecker.checkConfig({
            config: {}
        })).to.deep.include(ConfigChecker.getMessageObject(ConfigChecker.LEVEL_WARNING, "Config property 'type' for response type not set -> using default value 'json'"));
    });

    it('warns about empty request body for POST and PUT requests', function() {
        expect(ConfigChecker.checkConfig({
            config: {
                method: 'post',
                body: null
            }
        })).to.deep.include(ConfigChecker.getMessageObject(ConfigChecker.LEVEL_WARNING, "Config property 'body' for request body not set in POST or PUT request method"));

        expect(ConfigChecker.checkConfig({
            config: {
                method: 'PUT'
            }
        })).to.deep.include(ConfigChecker.getMessageObject(ConfigChecker.LEVEL_WARNING, "Config property 'body' for request body not set in POST or PUT request method"));

        expect(ConfigChecker.checkConfig({
            config: {
                method: 'GET',
                body: null
            }
        })).to.not.deep.include(ConfigChecker.getMessageObject(ConfigChecker.LEVEL_WARNING, "Config property 'body' for request body not set in POST or PUT request method"));
    });

    it('warns about non-empty request body for GET request', function() {
        expect(ConfigChecker.checkConfig({
            config: {
                method: 'GET',
                body: {
                    foo: 'bar'
                }
            }
        })).to.deep.include(ConfigChecker.getMessageObject(ConfigChecker.LEVEL_WARNING, "Config property 'body' is set although request method is set to 'GET'"));

        expect(ConfigChecker.checkConfig({
            config: {
                method: 'post',
                body: {
                    foo: 'bar'
                }
            }
        })).to.not.deep.include(ConfigChecker.getMessageObject(ConfigChecker.LEVEL_WARNING, "Config property 'body' is set although request method is set to 'GET'"));
    });
});