var mongoose = require('mongoose');

var shopListSchema = mongoose.Schema({
    shopURL: {
        type: String,
        unique: true,
        required: true
    },
    WXCode: {
        type: String,
    },
    Description: {
        type: String,
    },
    AlbumName: {
        type: String,
    },
},
    {
        timestamps: {
            createdAt: 'created_at'
        }
    });

module.exports = mongoose.model('shopListModel', shopListSchema);
