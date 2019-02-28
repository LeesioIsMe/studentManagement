var mongoose = require('mongoose');
var studentModel = require("../models/student_model").studentModel;
var courseModel = require("../models/course_model").courseModel;
var stuCourseModel = require("../models/stu_course_model").stuCourseModel;
// 成绩模型
var scoreModel = mongoose.model('score', {
    times: {
        type: String,
        required: true
    },
    stu_course_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:stuCourseModel
    },
    score: {
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
}, 'scores');

module.exports = {
    scoreModel
}