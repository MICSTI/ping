var db = require('../db');
var Schema = db.Schema;

var Site = db.model('Site', {
    name: {
        type: String,
        required: "A name for the site is required"
    },
    url: {
        type: String
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
    status: {
        type: String,
        enum: ['ok', 'fail', 'null'],
        default: 'null'
    },
    statusDetail: [{
        type: String
    }],
    uptime: {
        type: Object
    },
    downtime: {
        type: Object
    },
    maintime: {
        type: Object
    },
    lastChecked: {
        type: Date
    },
    config: {
        type: Object
    }
});

module.exports = Site;