var express = require('express');
// md5加密模块，用来对数据进行加密，目的是为了数据安全，md5是非对称加密，只能加密，不能解密。而对称加密，通过相应的密钥加密后数据，能再次通过密钥解密。
var md5 = require('md5');
var router = express.Router();

// 导入操作数据库的模块及创建实体模型
var dbose = require('../modules/dbose');
var users = dbose.userModel;

// 导入验证是否登录模块。
var check = require('../modules/check');
var checkLogin = check.checkLogin;

var multer = require("multer");

var storage = multer.diskStorage({
    destination: "./public/images/logo",
    filename: function (req, file, callback) {
        callback(null, Date.now() + "-" + file.originalname);
    }
})
var upload = multer({
    storage
})

// 验证接口：添加数据时验证用户名是否存在，存在返回'true'，否则返回'false'
router.post('/checkLoginName', (req, res) => {
    // req.body.xxx用来获取客户端form表单post请求的数据或通过ajax请求携带的post请求的数据。
    var loginName = req.body.loginName;
    if (!loginName) {
        res.send('false');
        return;
    }

    users.find({ loginName }).then(u => {
        res.send(u.length > 0 ? 'false' : 'true');
    });
})

// 验证接口：编辑数据时验证用户名是否存在。
router.post('/checkLoginNameEdit', (req, res) => {
    var loginName = req.body.loginName;
    var oldLoginName = req.body.oldLoginName;
    if (!loginName || !oldLoginName) {
        res.send('false');
        return;
    }

    if (loginName === oldLoginName) {
        res.send('true');
        return;
    }

    // find()根据查询条件查询数据，可以使用回调函数作为第二个参数，也可以使用then()方法
    users.find({ loginName }).then(u => {
        res.send(u.length > 0 ? 'false' : 'true');
    });
})

// 注册接口
router.post('/register', (req, res) => {
    var loginName = req.body.loginName;
    var password = req.body.password;
    if (!loginName || !password) {
        res.send({
            code: 201,
            message: '用户名，密码不能为空'
        })
        return;
    }

    // 密码加密。
    password = md5(password);

    // insertMany()一次插入多条数据，当参数数组中只有一个对象时插入一条数据
    users.insertMany([{ loginName, password }]).then((result) => {
        res.send({
            code: 200,
            message: '注册成功'
        })
    })
})

// 登录接口
router.post('/login', (req, res) => {
    var loginName = req.body.loginName;
    var password = req.body.password;
    var remember = req.body.remember;
    if (!loginName || !password) {
        res.send({
            code: 201,
            message: '用户名，密码不能为空'
        })
        return;
    }

    password = md5(password);

    // findOne()和find()类似，区别在于一次只能查询一条数据，而find()可以查询一条，也可以查询多条，findOne()返回的是对象，而find()返回的是数组。
    users.findOne({ loginName, password }).then(u => {
        if (!u) {
            res.send({
                code: 201,
                message: '用户名或密码错误'
            });
            return;
        }

        if (remember === 'true') {
            // 设置cookie，参数1：cookie键名，参数2：cookie值，参数3：配置项，比如：cookie过期时间等，请参看文档。
            res.cookie('account', loginName, { expires: new Date(Date.now() + 28800000) });
        } else {
            // 清除cookie
            res.clearCookie('account');
        }

        res.cookie('loginName', loginName, { expires: new Date(Date.now() + 28800000) });
        res.send({
            code: 200,
            message: '登录成功'
        });
    })
})

// 注销接口
router.post('/logout', (req, res) => {
    res.clearCookie('loginName');
    res.send({
        code: 200,
        message: '注销成功'
    });
})

// 查询多个用户接口
// :page和:pageSize是接口路径中的点位符，此种数据通过req.params.xxx来获取。
router.get('/getUsers/:page/:pageSize', checkLogin, (req, res) => {
    // req.query.xxx获取客户端form表单get请求时的数据，即queryString查询字符串格式的数据。
    var searchKey = req.query.searchKey;
    var beginDate = req.query.beginDate;
    var endDate = req.query.endDate;
    // req.params.xxx用来获取占位符数据。
    var page = req.params.page - 0 || 1;
    var pageSize = req.params.pageSize - 0 || 10;

    // 构造查询条件
    var condition = {};
    if (searchKey) {
        var re = new RegExp(`${searchKey}`, "gim");
        condition['$or'] = [{ loginName: re }, { nickname: re }];
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

    // select()用来筛选是否显示数据库集合中的某列，0不显示，1显示。
    // 不使用select()时，默认显示所有列。为了安全，一般不建议显示密码。
    // countDocuments()类似于count()用来获取集合中数据条数，建议使用此方法，而count()被废弃。
    users.find(condition).select({ password: 0 }).countDocuments().then(c => {
        var totalPage = Math.ceil(c / pageSize);

        // sort()用来排序，1正序，-1倒序。skip()跳过的数据条数。limit()限制取多少条。
        users.find(condition).sort({ createTime: -1 }).select({ password: 0 }).skip((page - 1) * pageSize).limit(pageSize).then(u => {
            res.send({
                code: 200,
                message: '查询成功',
                jsonData: u,
                pages: check.getPages(page, totalPage),
                currPage: page,
                totalPage,
                pageSize
            });
        })
    })
})

// 添加用户接口
router.post('/addUser', checkLogin, (req, res) => {
    var loginName = req.body.loginName;
    var nickname = req.body.nickname;
    var password = req.body.password;
    var filePath = req.body.filePath;
    if (!loginName || !password) {
        res.send({
            code: 201,
            message: '用户名和密码不能为空'
        });
        return;
    }

    password = md5(password);

    users.insertMany([{ nickname, loginName, password, logo: filePath }]).then(result => {
        res.send({
            code: 200,
            message: '保存成功'
        });
    })

})

router.post('/upload', checkLogin, upload.single('file'), (req, res) => {
    var fileName = req.file.filename;
    var filePath = `/images/logo/${fileName}`;
    res.json({
        code: 200,
        message: '上传成功',
        filePath
    })
})

// 获取单个用户接口：根据主键获取一条用户数据
router.get('/getUser/:id', checkLogin, (req, res) => {
    var id = req.params.id;
    if (!id) {
        res.send({
            code: 201,
            message: '参数id不能为空'
        });
        return;
    }

    // findById()类似于findOne()都是取一条数据，且返回的都是对象，但前者只能按主键查询，后者查询条件不限制。
    users.findById(id).then(u => {
        if (!u) {
            res.send({
                code: 201,
                message: '不存在此id的数据'
            });
            return;
        }

        res.send({
            code: 200,
            message: '查询成功',
            entry: u
        });
    })
})

// 编辑用户接口
router.post('/editUser/:id', checkLogin, (req, res) => {
    var id = req.params.id;
    var loginName = req.body.loginName;
    var nickname = req.body.nickname;
    var password = req.body.password;
    if (!id || !loginName || !password) {
        res.send({
            code: 201,
            message: '参数不合法'
        });
        return;
    }

    password = md5(password);

    // findByIdAndUpdate()根据主键查询一条数据并编辑
    users.findByIdAndUpdate(id, { $set: { nickname, loginName, password } }).then(result => {
        res.send({
            code: 200,
            message: '更新成功'
        });
    })
})

// 删除单个用户接口
router.post('/removeUser/:id', checkLogin, (req, res) => {
    var id = req.params.id;
    if (!id) {
        res.send({
            code: 201,
            message: '参数不合法'
        });
        return;
    }

    users.findByIdAndDelete(id).then(result => {
        res.send({
            code: 200,
            message: '删除成功'
        });
    })
})

// 批量删除用户接口
router.post('/removeUsers/:id', checkLogin, (req, res) => {
    var ids = req.params.id;
    if (!ids) {
        res.send({
            code: 201,
            message: '参数不合法'
        });
        return;
    }
    ids = ids.split(',');

    users.deleteMany({ _id: { $in: ids } }).then(result => {
        res.send({
            code: 200,
            message: '批量删除成功'
        });
    })
})


module.exports = router;
