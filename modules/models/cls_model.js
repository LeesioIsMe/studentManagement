var mongoose = require('mongoose');
var departModel = require('./depart_model').departModel;
// 班级模型
var clsModel = mongoose.model('cls', {
    departId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: departModel
    },
    className: {
        type: String,
        required: true
    },
    createTime: {
        type: Date,
        default: new Date()
    },
    updateTime: {
        type: Date,
        default: new Date()
    }
}, 'classes');

module.exports = {
    clsModel
}