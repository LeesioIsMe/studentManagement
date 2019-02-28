var express = require('express');
var router = express.Router();

var dbose = require('../modules/dbose');
var courses = dbose.courseModel;

var check = require('../modules/check');
var checkLogin = check.checkLogin;

router.get('/getCourses/:page/:pageSize', checkLogin, (req, res) => {
    var searchKey = req.query.searchKey;
    var clsId = req.query.clsId;
    var beginDate = req.query.beginDate;
    var endDate = req.query.endDate;
    var page = req.params.page - 0 || 1;
    var pageSize = req.params.pageSize - 0 || 10;

    var condition = {};
    if (searchKey) {
        var re = new RegExp(`${searchKey}`, "gim");
        condition['$or'] = [
            { courseName: re }
        ];
    }

    if (clsId != "all") {
        condition.clsId = dbose.mongoose.Types.ObjectId(clsId);
    }

    if (beginDate && endDate) {
        condition['$and'] = [{ createTime: { $gte: beginDate, $lte: endDate } }];
    } else {
        if (beginDate) {
            condition.createTime = { $gte: beginDate };
        }
        if (endDate) {
            condition.createTime = { $lte: endDate };
        }
    }

    courses.find(condition).countDocuments().then(c => {
        var totalPage = Math.ceil(c / pageSize);

        courses.find(condition).populate('clsId').sort({ createTime: -1 }).skip((page - 1) * pageSize).limit(pageSize).then(d => {
            res.send({
                code: 200,
                message: '查询成功',
                jsonData: d,
                pages: check.getPages(page, totalPage),
                currPage: page,
                totalPage,
                pageSize
            });
        })
    })
})

router.post('/addCourse', checkLogin, (req, res) => {
    var clsId = req.body.clsId;
    var courseName = req.body.courseName;
    var credit = req.body.credit;
    if (!clsId || !courseName || !credit) {
        res.send({
            code: 201,
            message: '参数有误'
        });
        return;
    }
    credit = credit - 0;

    courses.insertMany([{ clsId, courseName, credit }]).then(result => {
        res.send({
            code: 200,
            message: '保存成功'
        });
    })
})

router.get('/getCourse/:id', checkLogin, (req, res) => {
    var id = req.params.id;
    if (!id) {
        res.send({
            code: 201,
            message: '参数id不能为空'
        });
        return;
    }

    courses.findById(id).populate('clsId').then(d => {
        if (!d) {
            res.send({
                code: 201,
                message: '不存在此id的数据'
            });
            return;
        }

        res.send({
            code: 200,
            message: '查询成功',
            entry: d
        });
    })
})

router.post('/editCourse/:id', checkLogin, (req, res) => {
    var id = req.params.id;
    var clsId = req.body.clsId;
    var courseName = req.body.courseName;
    var credit = req.body.credit;
    if (!id || !clsId || !courseName || !credit) {
        res.send({
            code: 201,
            message: '参数不合法'
        });
        return;
    }
    credit = credit - 0;

    courses.findByIdAndUpdate(id, { $set: { clsId, courseName, credit } }).then(result => {
        res.send({
            code: 200,
            message: '更新成功'
        });
    })
})

router.post('/removeCourse/:id', checkLogin, (req, res) => {
    var id = req.params.id;
    if (!id) {
        res.send({
            code: 201,
            message: '参数不合法'
        });
        return;
    }

    courses.findByIdAndDelete(id).then(result => {
        res.send({
            code: 200,
            message: '删除成功'
        });
    })
})

router.post('/removeCourses/:id', checkLogin, (req, res) => {
    var ids = req.params.id;
    if (!ids) {
        res.send({
            code: 201,
            message: '参数不合法'
        });
        return;
    }
    ids = ids.split(',');

    courses.deleteMany({ _id: { $in: ids } }).then(result => {
        res.send({
            code: 200,
            message: '批量删除成功'
        });
    })
})

module.exports = router;
