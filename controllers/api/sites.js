var router = require('express').Router();
var config = require('../../config/server');
var protectRoute = require('../protect');

var Site = require('../../models/site');

/**
 * Returns all sites in the database.
 */
router.get('/', function(req, res, next) {
    Site.find({})
        .populate('notify')
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

router.put('/:siteId/maintenance', protectRoute, function(req, res, next) {
    var error;

    var siteId = req.params.siteId;
    var maintenanceStatus = req.body.maintenance;

    if (siteId === undefined) {
        error = new Error();
        error.status = 400;
        error.message = "Missing 'siteId' parameter";

        return next(error);
    }

    if (maintenanceStatus === undefined) {
        error = new Error();
        error.status = 400;
        error.message = "Missing mandatory body parameter 'maintenance'";

        return next(error);
    }

    if (typeof maintenanceStatus !== 'boolean') {
        error = new Error();
        error.status = 400;
        error.message = "Illegal type for body parameter 'maintenance': Value must be of type 'boolean'";

        return next(error);
    }

    Site.findOne({
        _id: siteId
    }, function(err, site) {
        if (err) {
            error = new Error();
            error.status = 400;
            error.message = err.message;

            return next(error);
        }

        if (!site) {
            error = new Error();
            error.status = 400;
            error.message = "No site with this id found";

            return next(error);
        }

        site.maintenance = maintenanceStatus;

        site.save(function(err) {
            if (err) {
                error = new Error();
                error.status = 400;
                error.message = err.message;

                return next(error);
            }

            res.status(200).send();
        });
    });
});

module.exports = router;