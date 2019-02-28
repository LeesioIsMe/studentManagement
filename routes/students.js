var express = require('express');
var router = express.Router();

var dbose = require('../modules/dbose');
var students = dbose.studentModel;

var check = require('../modules/check');
var checkLogin = check.checkLogin;

router.post('/checkStuNo', checkLogin, (req, res) => {
    var stuNo = req.body.stuNo;
    if (!stuNo) {
        res.send('false');
        return;
    }

    students.find({ stuNo }).then(d => {
        res.send(d.length > 0 ? 'false' : 'true');
    });
})

router.post('/checkStuNoEdit', checkLogin, (req, res) => {
    var stuNo = req.body.stuNo;
    var oldStuNo = req.body.oldStuNo;
    if (!stuNo || !oldStuNo) {
        res.send('false');
        return;
    }

    if (stuNo === oldStuNo) {
        res.send('true');
        return;
    }

    students.find({ stuNo }).then(d => {
        res.send(d.length > 0 ? 'false' : 'true');
    });
})

router.get('/getStus/:page/:pageSize', checkLogin, (req, res) => {
    var searchKey = req.query.searchKey;
    var clsId = req.query.clsId;
    var sex = req.query.sex;
    var beginDate = req.query.beginDate;
    var endDate = req.query.endDate;
    var page = req.params.page - 0 || 1;
    var pageSize = req.params.pageSize - 0 || 10;

    var condition = {};
    if (searchKey) {
        var re = new RegExp(`${searchKey}`, "gim");
        condition['$or'] = [
            { stuName: re },
            { stuNo: re }
        ];
    }

    if (clsId != "all") {
        condition.clsId = dbose.mongoose.Types.ObjectId(clsId);
    }

    if (sex != "all") {
        condition.sex = sex == 'true' ? true : false;
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
    
    students.find(condition).countDocuments().then(c => {
        var totalPage = Math.ceil(c / pageSize);

        students.find(condition).populate('clsId').sort({ createTime: -1 }).skip((page - 1) * pageSize).limit(pageSize).then(d => {
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

router.post('/addStu', checkLogin, (req, res) => {
    var clsId = req.body.clsId;
    var stuName = req.body.stuName;
    var stuNo = req.body.stuNo;
    var sex = req.body.sex;
    var age = req.body.age;
    var birthday = req.body.birthday;
    var phone = req.body.phone;
    var nativePlace = req.body.nativePlace;
    if (!clsId || !stuName || !stuNo || !sex) {
        res.send({
            code: 201,
            message: '参数有误'
        });
        return;
    }

    sex = sex == 'true' ? true : false;
    age = age - 0;

    students.insertMany([{ clsId, stuName, stuNo, sex, age, birthday, phone, nativePlace }]).then(result => {
        res.send({
            code: 200,
            message: '保存成功'
        });
    })
})

router.get('/getStu/:id', checkLogin, (req, res) => {
    var id = req.params.id;
    if (!id) {
        res.send({
            code: 201,
            message: '参数id不能为空'
        });
        return;
    }

    students.findById(id).populate('clsId').then(d => {
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

router.post('/editStu/:id', checkLogin, (req, res) => {
    var id = req.params.id;
    var clsId = req.body.clsId;
    var stuName = req.body.stuName;
    var stuNo = req.body.stuNo;
    var sex = req.body.sex;
    var age = req.body.age;
    var birthday = req.body.birthday;
    var phone = req.body.phone;
    var nativePlace = req.body.nativePlace;
    if (!id || !clsId || !stuName || !stuNo || !sex) {
        res.send({
            code: 201,
            message: '参数不合法'
        });
        return;
    }

    age = age - 0;
    sex = sex == 'true' ? true : false;

    students.findByIdAndUpdate(id, { $set: { clsId, stuName, stuNo, sex, age, birthday, phone, nativePlace } }).then(result => {
        res.send({
            code: 200,
            message: '更新成功'
        });
    })
})

router.post('/removeStu/:id', checkLogin, (req, res) => {
    var id = req.params.id;
    if (!id) {
        res.send({
            code: 201,
            message: '参数不合法'
        });
        return;
    }

    students.findByIdAndDelete(id).then(result => {
        res.send({
            code: 200,
            message: '删除成功'
        });
    })
})

router.post('/removeStus/:id', checkLogin, (req, res) => {
    var ids = req.params.id;
    if (!ids) {
        res.send({
            code: 201,
            message: '参数不合法'
        });
        return;
    }
    ids = ids.split(',');

    students.deleteMany({ _id: { $in: ids } }).then(result => {
        res.send({
            code: 200,
            message: '批量删除成功'
        });
    })
})

module.exports = router;
