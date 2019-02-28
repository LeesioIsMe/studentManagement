var mongoose = require('mongoose');
var clsModel = require('./cls_model').clsModel;
// 学生模型
var studentModel = mongoose.model('student', {
    clsId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: clsModel
    },
    stuName: {
        type: String,
        required: true
    },
    stuNo: {
        type: String,
        required: true
    },
    sex: {
        type: Boolean,
        required: true
    },
    age: {
        type: Number,
        min: 10,
        max: 80,
        default: 18 
    },
    birthday: {
        type: Date,
        default: new Date()
    },
    phone: {
        type: String,
        default: ''
    },
    nativePlace:  {
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
}, 'students');

module.exports = {
    studentModel
}