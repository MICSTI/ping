var db = require('../db');
var Schema = db.Schema;

var Site = db.model('Site', {
    name: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    active: {
        type: Boolean,
        default: true
    },
    notify: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    maintenance: {
        type: Boolean,
        default: false
    },
    uptime: {
        type: Object
    },
    downtime: {
        type: Object
    },
    maintime: {
        type: Object
    }
});

module.exports = Site;