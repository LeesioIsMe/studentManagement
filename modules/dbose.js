var mongoose = require('mongoose');
var userModel = require('./models/user_model').userModel;
var collageModel = require('./models/collage_model').collageModel;
var departModel = require('./models/depart_model').departModel;
var clsModel = require('./models/cls_model').clsModel;
var studentModel = require('./models/student_model').studentModel;
var courseModel = require('./models/course_model').courseModel;
var stuCourseModel = require('./models/stu_course_model').stuCourseModel;
var scoreModel = require('./models/score_model').scoreModel;

mongoose.connect('mongodb://127.0.0.1:27017/student-db', { useNewUrlParser: true });

module.exports = {
    mongoose,
    
    userModel,
    collageModel,
    departModel,
    clsModel,
    studentModel,
    courseModel,
    stuCourseModel,
    scoreModel
}