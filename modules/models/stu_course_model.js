var mongoose = require('mongoose');
var stuModel = require("../models/student_model").studentModel;
var courseModel = require("../models/course_model").courseModel;
// 学生和课程关系模型
var stuCourseModel = mongoose.model('stuCourse', {
    stuId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:stuModel
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:courseModel
    }
}, 'stuCourses');

module.exports = {
    stuCourseModel
}