var mongoose = require('mongoose');
var collageModel = require('./collage_model').collageModel;
// 院系模型
var departModel = mongoose.model('depart', {
    collageId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: collageModel // ref=>refer相关， 对应要关联的集合模型名称。
    },
    departName: {
        type: String,
        required: true
    },
    departAddress: {
        type: String,
        default: ''
    },
    departTelephone: {
        type: String,
        default: ''
    },
    departWebsite: {
        type: String,
        default: ''
    },
    createTime: {
        type: Date,
        default: new Date()
    },
    updateTime: {
        type: Date,
        default: new Date()
    }
}, 'departments');

module.exports = {
    departModel
}