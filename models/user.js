var db = require('../db');

var User = db.model('User', {
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    resetToken: {
        type: String
    },
    resetTokenValid: {
        type: Date
    }
});

module.exports = User;