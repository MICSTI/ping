var chai = require("chai");
var chaiHttp = require("chai-http");
var fs = require('fs');
var path = require('path');

var should = chai.should();
var expect = chai.expect;

chai.use(chaiHttp);

// dummy test
describe('dummy test', function() {
    it('should be able to calculate', function() {
        expect(42).to.equal(42);
    });
});