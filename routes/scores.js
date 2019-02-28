var express = require('express');
var router = express.Router();

var dbose = require('../modules/dbose');
var scores = dbose.scoreModel;
var stuCourse = dbose.stuCourseModel;
var student = dbose.studentModel;
var course = dbose.courseModel;
var check = require('../modules/check');
var checkLogin = check.checkLogin;

var editId = "";

router.get("/getScores", (req, res) => {
    var id = req.query.id || "";
    editId = id;
    var index = req.query.index;

    var searchKey = req.query.searchKey || "";

    if (searchKey != "") {
        scores.find().then(score => {
            stuCourse.find().populate("stuId").populate("courseId").then(sc => {
                if (sc.length == 0) {
                    res.send({
                        code: 201,
                        message: "没有数据"
                    })
                    return;
                }
                var scSearchResult = [];
                var scoreSearchResult = [];
                sc.forEach(function (v, i) {
                    if (v.stuId.stuNo == searchKey || v.stuId.stuName == searchKey || v.courseId.courseName == searchKey) {
                        scSearchResult.push(v);
                    }
                })
                score.forEach(function (v1, i) {
                    scSearchResult.forEach(function (v2, j) {
                        console.log(i + " " + j + " " + v1.stu_course_id + " " + v2._id)
                        if (v1.stu_course_id.toString().trim() === v2._id.toString().trim()) {
                            scoreSearchResult.push(v1);
                        }
                    })
                })
                console.log(scSearchResult)
                console.log(scoreSearchResult)
                res.send({
                    code: 200,
                    message: "成功",
                    score:scoreSearchResult,
                    sc:scSearchResult
                })
            })

        })
        return;
    }
    if (id != "") {
        scores.findOne({ _id: id }).populate("stu_course_id").then(score => {
            // console.log("score-----------" + score.stu_course_id.stuId)
            stuCourse.find().populate("stuId").populate("courseId").then(sc => {
                // console.log(sc[index])
                if (sc.length == 0) {
                    res.send({
                        code: 201,
                        message: "没有数据"
                    })
                    return;
                }
                res.send({
                    code: 200,
                    message: "成功",
                    score,
                    stuCourse: sc[index]
                })
                return;
            })

        })
        return;
    }
    scores.find().populate("stu_course_id").then(score => {
        stuCourse.find().populate("stuId").populate("courseId").then(sc => {
            if (sc.length == 0) {
                res.send({
                    code: 201,
                    message: "没有数据"
                })
                return;
            }
            res.send({
                code: 200,
                message: "成功",
                score,
                sc
            })

        })

    })
})
router.get("/getStuCourses", (req, res) => {
    student.find().then(stus => {
        course.find().then(courses => {
            res.send({
                code: 200,
                message: "成功",
                stus,
                courses
            })
        })
    })
})

router.post("/addScore", (req, res) => {
    var stuId = req.body.stuId;
    var courseId = req.body.courseId;
    var score = req.body.score;
    var times = req.body.times;
    stuCourse.findOne({ stuId, courseId }).then(result => {
        if (result) {
            res.send({
                code: 201,
                message: "此学生该课程成绩已存在"
            })
            return;
        }
        stuCourse.insertMany([{ stuId, courseId }]).then(sc => {
            // console.log(sc[0]._id)
            scores.insertMany([{ stu_course_id: sc[0]._id, times, score }]).then(result => {
                res.send({
                    code: 200,
                    message: "添加成功"
                })
            }, err => {
                throw err;
            })
        }, err => {
            throw err;
        })
    })

})

router.post("/editScore", (req, res) => {
    var times = req.body.etimes;
    var score = req.body.escore;
    console.log(editId);
    scores.findOneAndUpdate({ _id: editId }, { $set: { times, score } }).then(score => {
        res.send({
            code: 200,
            message: "编辑成功"
        })
    }, err => {
        throw err;
    })
})

var deleteId = "";
router.get("/getScore", (req, res) => {
    var id = req.query.id;
    deleteId = id;
    scores.findOne({ _id: id }).populate("stu_course_id").then(score => {
        stuCourse.findOne({ _id: score.stu_course_id }).populate("stuId").populate("courseId").then(stuCourse => {
            res.send({
                code: 200,
                message: "成功",
                stuCourse
            })
        })
    })
})

router.post("/deleteScore", (req, res) => {
    scores.findOneAndDelete({ _id: deleteId }).populate("stu_course_id").then(s => {
        stuCourse.findOneAndDelete({ _id: s.stu_course_id }).populate("stuId").populate("courseId").then(sc => {
            console.log(s)
            console.log(sc)
            res.send({
                code: 200,
                message: "成功",
                scores: s,
                stuCourse: sc
            })
        })
    })

})

router.post("/deleteSelected", (req, res) => {
    var deleteScores = req.body.deleteScores.split(",");
    // console.log(deleteScores)
    scores.find({ _id: { $in: deleteScores } }).populate("stu_course_id").then(result => {
        var delStuCourses = [];
        result.forEach(function (e, i) {
            delStuCourses.push(e.stu_course_id._id);
        })
        // console.log(delStuCourses);
        scores.deleteMany({ _id: { $in: deleteScores } }).populate("stu_course_id").then(result => {
            stuCourse.deleteMany({ _id: { $in: delStuCourses } }).then(sc => {
                console.log(sc);
                res.send({
                    code: 200,
                    message: "批量删除成功"
                })
            })
        })

    }, err => {
        throw err;
    })
})

module.exports = router;
