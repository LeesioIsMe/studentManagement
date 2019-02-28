var mongoose = require('mongoose');
// 学校模型
var collageModel = mongoose.model('collage', {
    collageName: {
        type: String,
        required: true
    },
    collageAddress: {
        type: String,
        default: ''
    },
    collageTelephone: {
        type: String,
        default: ''
    },
    headmaster: {
        type: String,
        default: ''
    },
    collageWebsite: {
        type: String,
        default: ''
    },
    buildTime: {
        type: Date,
        default: new Date()
    },
    createTime: {
        type: Date,
        default: new Date()
    },
    updateTime: {
        type: Date,
        default: new Date()
    }
}, 'collages');

module.exports = {
    collageModel
}