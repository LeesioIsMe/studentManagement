var express = require('express');
var router = express.Router();

var dbose = require('../modules/dbose');
var classes = dbose.clsModel;

var check = require('../modules/check');
var checkLogin = check.checkLogin;

router.post('/checkClassName', checkLogin, (req, res) => {
    var className = req.body.className;
    if (!className) {
        res.send('false');
        return;
    }

    classes.find({ className }).then(d => {
        res.send(d.length > 0 ? 'false' : 'true');
    });
})

router.post('/checkClassNameEdit', checkLogin, (req, res) => {
    var className = req.body.className;
    var oldClassName = req.body.oldClassName;
    if (!className || !oldClassName) {
        res.send('false');
        return;
    }

    if (className === oldClassName) {
        res.send('true');
        return;
    }

    classes.find({ className }).then(d => {
        res.send(d.length > 0 ? 'false' : 'true');
    });
})

router.get('/getClasses/:page/:pageSize', checkLogin, (req, res) => {
    var searchKey = req.query.searchKey;
    var departId = req.query.departId;
    var beginDate = req.query.beginDate;
    var endDate = req.query.endDate;
    var page = req.params.page - 0 || 1;
    var pageSize = req.params.pageSize - 0 || 10;

    var condition = {};
    if (searchKey) {
        var re = new RegExp(`${searchKey}`, "gim");
        condition['$or'] = [
            { className: re }
        ];
    }

    if (departId != "all") {
        condition.departId = dbose.mongoose.Types.ObjectId(departId);
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

    classes.find(condition).countDocuments().then(c => {
        var totalPage = Math.ceil(c / pageSize);

        // aggregate()聚合方法，可以让两个模型产生关联。不必设置模型的ref属性。
        classes.aggregate([
            {
                // $lookup关联
                $lookup:
                {
                    from: "departments",    //需要关联的表【departments】
                    localField: "departId", //【classes】表需要关联的外键。
                    foreignField: "_id",    //【departments】表需要关联的主键。
                    as: "class_depart"    // 结果集的别名
                }
            },
            // $match匹配，相当于find({})中的查询条件。
            { $match: condition }
        ]).sort({ createTime: -1 }).skip((page - 1) * pageSize).limit(pageSize).then(d => {
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

router.get('/getClasses', checkLogin, (req, res) => {
    classes.find().then(d => {
        if (!d) {
            res.send({
                code: 201,
                message: '还未添加数据'
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

router.post('/addClass', checkLogin, (req, res) => {
    var departId = req.body.departId;
    var className = req.body.className;
    if (!departId || !className) {
        res.send({
            code: 201,
            message: '参数有误'
        });
        return;
    }

    classes.insertMany([{ departId, className }]).then(result => {
        res.send({
            code: 200,
            message: '保存成功'
        });
    })
})

router.get('/getClass/:id', checkLogin, (req, res) => {
    var id = req.params.id;
    if (!id) {
        res.send({
            code: 201,
            message: '参数id不能为空'
        });
        return;
    }

    classes.findById(id).populate('departId').then(d => {
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

router.post('/editClass/:id', checkLogin, (req, res) => {
    var id = req.params.id;
    var departId = req.body.departId;
    var className = req.body.className;
    if (!id || !departId || !className) {
        res.send({
            code: 201,
            message: '参数不合法'
        });
        return;
    }

    classes.findByIdAndUpdate(id, { $set: { departId, className } }).then(result => {
        res.send({
            code: 200,
            message: '更新成功'
        });
    })
})

router.post('/removeClass/:id', checkLogin, (req, res) => {
    var id = req.params.id;
    if (!id) {
        res.send({
            code: 201,
            message: '参数不合法'
        });
        return;
    }

    classes.findByIdAndDelete(id).then(result => {
        res.send({
            code: 200,
            message: '删除成功'
        });
    })
})

router.post('/removeClasses/:id', checkLogin, (req, res) => {
    var ids = req.params.id;
    if (!ids) {
        res.send({
            code: 201,
            message: '参数不合法'
        });
        return;
    }
    ids = ids.split(',');

    classes.deleteMany({ _id: { $in: ids } }).then(result => {
        res.send({
            code: 200,
            message: '批量删除成功'
        });
    })
})

module.exports = router;
