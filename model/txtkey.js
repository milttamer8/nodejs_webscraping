var mongoose = require('mongoose');

var txtkeySchema = mongoose.Schema({
    wxcode: {
        type: String,
        unique: true,
        required: true
    },
},
    {
        timestamps: {
            createdAt: 'created_at'
        }
    });

module.exports = mongoose.model('txtkeyModel', txtkeySchema);
