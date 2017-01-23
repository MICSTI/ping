var chai = require("chai");
var chaiHttp = require("chai-http");
var fs = require('fs');
var path = require('path');

var should = chai.should();
var expect = chai.expect;

chai.use(chaiHttp);

var Ping = require('../../controllers/ping');

// dummy test
describe('dummy test', function() {
    it('should be able to calculate', function() {
        expect(40 + 2).to.equal(42);
    });
});

// ping result checker
describe('ping', function() {
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
});