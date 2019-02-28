var mongoose = require('mongoose');
var clsModel = require('./cls_model').clsModel;
// 课程模型
var courseModel = mongoose.model('course', {
    clsId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: clsModel
    },
    courseName: {
        type: String,
        required: true
    },
    credit: {
        type: Number,
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
}, 'courses');

module.exports = {
    courseModel
}