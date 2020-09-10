var mongoose = require('mongoose');

var keywordSchema = mongoose.Schema({
    prop: {
        type: String,
        unique: true,
        required: true
    },
    value: {
        type: String,
    },
},
    {
        timestamps: {
            createdAt: 'created_at'
        }
    });

module.exports = mongoose.model('keywordModel', keywordSchema);
