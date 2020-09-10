var mongoose = require('mongoose');

var phashSchema = mongoose.Schema({
    phash: {
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

module.exports = mongoose.model('phashModel', phashSchema);
