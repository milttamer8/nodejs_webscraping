var mongoose = require('mongoose');

var pmtkeySchema = mongoose.Schema({
    wxcode: {
        type: String,
        unique: true,
        required: true
    },
    pmtkey: {
        type: String,
    },
},
    {
        timestamps: {
            createdAt: 'created_at'
        }
    });

module.exports = mongoose.model('pmtkeyModel', pmtkeySchema);
