var mongoose = require('mongoose');
// 用户模型
var userModel = mongoose.model('user', {
    loginName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    nickname: {
        type: String,
        default: ''
    },
    logo: {
        type: String,
        default: '/images/default.jpg'
    },
    createTime: {
        type: Date,
        default: new Date()
    },
    updateTime: {
        type: Date,
        default: new Date()
    }
}, 'users');

module.exports = {
    userModel
}