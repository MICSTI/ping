var router = require('express').Router();
var config = require('../../config/server');
var protectRoute = require('../protect');

var Site = require('../../models/site');

/**
 * Returns the high score list for the quiz.
 * Contains the overall score considering all users.
 */
router.get('/', function(req, res, next) {
    res.status(200).json([{
        name: "evoCall Production",
        description: "The best industry 4.0 solution in the world",
        url: "https://evogeneral.evolaris.net:8765",
        listeners: [
            { username: "Michael Stifter" },
            { username: "Markus Streibl" }
        ]
    }, {
        name: "evoCall Development",
        description: "The best industry 4.0 solution in the world (in development mode)",
        url: "https://evogeneral.evolaris.net:8766",
        listeners: [
            { username: "Michael Stifter" }
        ]
    }]);
});

module.exports = router;