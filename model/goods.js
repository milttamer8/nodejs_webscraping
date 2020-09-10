var mongoose = require('mongoose');

var goodsSchema = mongoose.Schema({
    goods_id: {
        type: String,
        unique: false,
        required: true,
    },
    imgsSrc: {
        type: String,
    }

},
    {
        timestamps: {
            createdAt: 'created_at'
        }
    })
module.exports = mongoose.model('goodsModel', goodsSchema);