var express = require('express');
var router = express.Router();

var dbose = require('../modules/dbose');
var departs = dbose.departModel;

var check = require('../modules/check');
var checkLogin = check.checkLogin;

router.post('/checkDepartName', checkLogin, (req, res) => {
    var departName = req.body.departName;
    if (!departName) {
        res.send('false');
        return;
    }

    departs.find({ departName }).then(d => {
        res.send(d.length > 0 ? 'false' : 'true');
    });
})

router.post('/checkDepartNameEdit', checkLogin, (req, res) => {
    var departName = req.body.departName;
    var oldDepartName = req.body.oldDepartName;
    if (!departName || !oldDepartName) {
        res.send('false');
        return;
    }

    if (departName === oldDepartName) {
        res.send('true');
        return;
    }

    departs.find({ departName }).then(d => {
        res.send(d.length > 0 ? 'false' : 'true');
    });
})

router.get('/getDepartsQueryString', checkLogin, (req, res) => {
// router.get('/getDeparts/:page/:pageSize', checkLogin, (req, res) => {
    var searchKey = req.query.searchKey;
    var beginDate = req.query.beginDate;
    var endDate = req.query.endDate;
    // var page = req.params.page - 0 || 1;
    // var pageSize = req.params.pageSize - 0 || 10;

    var page = req.query.page - 0 || 1;
    var pageSize = req.query.pageSize - 0 || 10;

    var condition = {};
    if (searchKey) {
        var re = new RegExp(`${searchKey}`, "gim");
        condition['$or'] = [
            { departName: re },
            { departAddress: re },
            { departTelephone: re },
            { departWebsite: re }
        ];
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

    departs.find(condition).countDocuments().then(c => {
        var totalPage = Math.ceil(c / pageSize);

        // populate()关联，必须在模型中设置ref=引用，这是让两个模型之间产生关联的第一种方式，也是最简单，最容易理解的方式，推荐使用。
        departs.find(condition).populate('collageId').sort({ createTime: -1 }).skip((page - 1) * pageSize).limit(pageSize).then(d => {
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

router.get('/getDeparts', (req, res) => {
    departs.find().then(d => {
        if (!d) {
            res.send({
                code: 201,
                message: '还未添加过院系'
            });
            return;
        }
        res.send({
            code: 200,
            message: '查询成功',
            jsonData: d
        });
    })
})

router.post('/addDepart', checkLogin, (req, res) => {
    var collageId = req.body.collageId;
    var departName = req.body.departName;
    var departAddress = req.body.departAddress;
    var departTelephone = req.body.departTelephone;
    var departWebsite = req.body.departWebsite;
    if (!collageId || !departName) {
        res.send({
            code: 201,
            message: '参数有误'
        });
        return;
    }

    departs.insertMany([{ collageId, departName, departAddress, departTelephone, departWebsite }]).then(result => {
        res.send({
            code: 200,
            message: '保存成功'
        });
    })
})

router.get('/getDepart/:id', checkLogin, (req, res) => {
    var id = req.params.id;
    if (!id) {
        res.send({
            code: 201,
            message: '参数id不能为空'
        });
        return;
    }

    departs.findById(id).populate('collageId').then(d => {
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

router.post('/editDepart/:id', checkLogin, (req, res) => {
    var id = req.params.id;
    var departName = req.body.departName;
    var departAddress = req.body.departAddress;
    var departTelephone = req.body.departTelephone;
    var departWebsite = req.body.departWebsite;
    if (!id || !departName) {
        res.send({
            code: 201,
            message: '参数不合法'
        });
        return;
    }

    departs.findByIdAndUpdate(id, { $set: { departName, departAddress, departTelephone, departWebsite } }).then(result => {
        res.send({
            code: 200,
            message: '更新成功'
        });
    })
})

router.post('/removeDepart/:id', checkLogin, (req, res) => {
    var id = req.params.id;
    if (!id) {
        res.send({
            code: 201,
            message: '参数不合法'
        });
        return;
    }

    departs.findByIdAndDelete(id).then(result => {
        res.send({
            code: 200,
            message: '删除成功'
        });
    })
})

router.post('/removeDeparts/:id', checkLogin, (req, res) => {
    var ids = req.params.id;
    if (!ids) {
        res.send({
            code: 201,
            message: '参数不合法'
        });
        return;
    }
    ids = ids.split(',');

    departs.deleteMany({ _id: { $in: ids } }).then(result => {
        res.send({
            code: 200,
            message: '批量删除成功'
        });
    })
})

module.exports = router;
