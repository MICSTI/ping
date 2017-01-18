var router = require('express').Router();
var config = require('../../config/server');
var protectRoute = require('../protect');

var User = require('../../models/user');

/**
 * Returns the high score list for the quiz.
 * Contains the overall score considering all users.
 */
router.get('/', function(req, res, next) {
    res.status(200).json([{
        username: "Michael Stifter"
    }, {
        username: "Markus Streibl"
    }]);
});

module.exports = router;