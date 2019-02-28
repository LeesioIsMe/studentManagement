var express = require('express');
var router = express.Router();

var dbose = require('../modules/dbose');
var collages = dbose.collageModel;

var check = require('../modules/check');
var checkLogin = check.checkLogin;

router.post('/add', checkLogin, (req, res) => {
    var collageName = req.body.collageName;
    var collageAddress = req.body.collageAddress;
    var collageTelephone = req.body.collageTelephone;
    var headmaster = req.body.headmaster;
    var collageWebsite = req.body.collageWebsite;
    var buildTime = req.body.buildTime;
    if (!collageName) {
        res.send({
            code: 201,
            message: '校名不能为空'
        })
        return;
    }

    // countDocuments()和count()方法类似，用来得到集合的数据条数。
    // 建议使用countDocuments()，而count()被废弃
    collages.find().countDocuments().then(total => {
        if (total == 0) { // 添加
            collages.insertMany([{
                collageName,
                collageAddress,
                collageTelephone,
                headmaster,
                collageWebsite,
                buildTime
            }]).then(c => {
                res.send({
                    code: 200,
                    message: '保存成功'
                });
            });
        } else { // 编辑
            var id = req.body.id;
            if (!id) {
                res.send({
                    code: 201,
                    message: '参数不能为空'
                })
                return;
            }
            collages.findByIdAndUpdate(id, {
                $set: {
                    collageName,
                    collageAddress,
                    collageTelephone,
                    headmaster,
                    collageWebsite,
                    buildTime
                }
            }).then(c => {
                res.send({
                    code: 200,
                    message: '编辑成功'
                });
            })
        }
    })
})

router.get('/getOne', checkLogin, (req, res) => {
    collages.findOne().then(c => {
        if (!c) {
            res.send({
                code: 201,
                message: '还未添加过学校'
            });
            return;
        }
        res.send({
            code: 200,
            message: '保存成功',
            entry: c
        });
    });
})

router.get('/getCollages', checkLogin, (req, res) => {
    collages.find().then(c => {
        if (!c) {
            res.send({
                code: 201,
                message: '还未添加过学校'
            });
            return;
        }
        res.send({
            code: 200,
            message: '查询成功',
            jsonData: c
        });
    });
})

module.exports = router;
