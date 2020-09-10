var mongoose = require('mongoose');

var nkeySchema = mongoose.Schema({
    wxcode: {
        type: String,
    },
    nkey: {
        type: String,
    },
},
    {
        timestamps: {
            createdAt: 'created_at'
        }
    });

module.exports = mongoose.model('nkeyModel', nkeySchema);
