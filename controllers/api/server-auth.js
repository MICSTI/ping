var jwt = require('jwt-simple');
var config = require('../../config/server');
var protectRoute = require('../protect');
var passwordUtil = require('../password');
var userUtil = require('../user');

var router = require('express').Router();
var User = require('../../models/user');

router.post('/session', function(req, res, next) {
    var error;

    // ensure username and password were sent
    if (!req.body.username || !req.body.password) {
        error = new Error();
        error.status = 401;
        error.message = "Parameters 'username' and 'password' are mandatory";

        return next(error);
    }

    var username = req.body.username;
    var password = req.body.password;

    userUtil.findUserByUsernameOrMail(username)
        .then(function(user) {
            passwordUtil.comparePassword(password, user.password)
                .then(function() {
                    var token = jwt.encode({ user: user._id }, config.secretKey);
                    return res.status(200).json(token);
                })
                .catch(function(errorMessage) {
                    var error = new Error();

                    error.status = 401;
                    error.message = errorMessage;

                    return next(error);
                });
        })
        .catch(function(err) {
            error = new Error();

            error.status = 401;
            error.message = err;

            return next(error);
        });
});

router.post('/user', function(req, res, next) {
    var error;

    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;

    if (!username) {
        error = new Error();
        error.status = 400;
        error.message = 'Missing parameter username';
        return next(error);
    }

    if (!email) {
        error = new Error();
        error.status = 400;
        error.message = 'Missing parameter email';
        return next(error);
    }

    if (!password) {
        error = new Error();
        error.status = 400;
        error.message = 'Missing parameter password';
        return next(error);
    }

    // ensure username is not already in use
    User.findOne({
        username: username
    }, function(err, existingUser) {
        if (err) {
            return next(err);
        }

        if (existingUser) {
            error = new Error();

            error.status = 400;
            error.message = "Username already exists";

            return next(error);
        }

        // also check if e-mail does not already exist
        User.findOne({
            email: email
        }, function(err, existing) {
            if (err) {
                return next(err);
            }

            if (existing) {
                error = new Error();

                error.status = 400;
                error.message = "Email address already exists";

                return next(error);
            }

            // create new user
            var user = new User({
                username: username,
                email: email
            });

            // generate salt and hash for password and save it to the user object
            passwordUtil.savePassword(user, password)
                .then(function() {
                    return res.status(201).send();
                })
                .catch(function(err) {
                    return next(err);
                });
        });
    });
});

/**
 * Route for basic user update (username and email).
 */
router.put('/user/basic', protectRoute, function(req, res, next) {
    var error;

    var username = req.body.username;
    var email = req.body.email;

    if (!username) {
        error = new Error();
        error.status = 400;
        error.message = 'Missing parameter username';
        return next(error);
    }

    if (!email) {
        error = new Error();
        error.status = 400;
        error.message = 'Missing parameter email';
        return next(error);
    }

    // ensure username is not already in use
    User.findOne({
        username: username
    }, function(err, existingUser) {
        if (err) {
            return next(err);
        }

        if (existingUser && !existingUser._id.equals(req.user._id)) {
            error = new Error();

            error.status = 400;
            error.message = "Username already exists";

            return next(error);
        }

        // find the own user
        User.findOne({
            _id: req.user._id
        }, function(err, user) {
            if (err) {
                return next(err);
            }

            if (!user) {
                error = new Error();

                error.status = 400;
                error.message = 'No user with this id found';

                return next(error);
            }

            // check if email address already exists somewhere else
            // also check if e-mail does not already exist
            User.findOne({
                email: email
            }, function(err, existing) {
                if (err) {
                    return next(err);
                }

                if (existing && !existing._id.equals(user._id)) {
                    error = new Error();

                    error.status = 400;
                    error.message = "Email address already exists";

                    return next(error);
                }

                user.username = username;
                user.email = email;
                user.color = color;

                user.save(function(err) {
                    if (err) {
                        return next(err);
                    }

                    res.status(200).json(user);
                });
            });
        });
    });
});

/**
 * Route handler for updating a user's password.
 */
router.put('/user/password', protectRoute, function(req, res, next) {
    var old = req.body.old;
    var password = req.body.password;

    var error;

    if (!old) {
        error = new Error();

        error.status = 400;
        error.message = 'Missing parameter old';

        return next(error);
    }

    if (!password) {
        error = new Error();

        error.status = 400;
        error.message = 'Missing parameter password';

        return next(error);
    }

    User.findOne( { _id: req.user._id, active: true } )
        .select('password')
        .exec(function(err, user) {
            if (err) {
                return next(err);
            }

            if (!user) {
                error = new Error();

                error.status = 401;
                error.message = "Username or password not valid";

                return next(error);
            }

            // check if the old password is correct
            passwordUtil.comparePassword(old, user.password)
                .then(function() {
                    // save the new password
                    passwordUtil.savePassword(req.user, password)
                        .then(function() {
                            return res.status(200).send();
                        })
                        .catch(function(err) {
                            return next(err);
                        });
                })
                .catch(function(errorMessage) {
                    error = new Error();

                    error.status = 401;
                    error.message = "Old password incorrect";

                    return next(error);
                });
        });
});

router.get('/user', protectRoute, function(req, res) {
    // since the route is protected, we can just send back the user object
    res.status(200).json(req.user);
});

module.exports = router;