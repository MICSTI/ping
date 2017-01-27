var router = require('express').Router();
var config = require('../../config/server');
var protectRoute = require('../protect');

var Site = require('../../models/site');

/**
 * Returns all sites in the database.
 */
router.get('/', function(req, res, next) {
    Site.find({})
        .exec(function(err, sites) {
            if (err) {
                var error = new Error();
                error.status = 400;
                error.message = err.message;

                return next(error);
            }

            res.status(200).json(sites);
        });
});

router.post('/', protectRoute, function(req, res, next) {
    var site = new Site(req.body);

    site.save(function(err) {
        if (err) {
            var error = new Error();
            error.status = 400;
            error.message = err.message;

            return next(error);
        }

        res.status(201).json(site);
    });
});

module.exports = router;