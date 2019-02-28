var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// 导入各种路由模块，目的：把路由模块当成中间件添加到管线中
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var collagesRouter = require('./routes/collages');
var departsRouter = require('./routes/departs');
var classesRouter = require('./routes/classes');
var studentsRouter = require('./routes/students');
var coursesRouter = require('./routes/courses');
var scoresRouter = require('./routes/scores');

var app = express();

// 各种管线（也称中间件），客户端的请求匹配到相应的中间件时，会进入中间件执行相应的业务逻辑
// 此中间件用来记录请求日志
app.use(logger('dev'));
// 此中间件用来解析客户端请求时携带的数据（比如：form表单中的数据，queryString查询字符串中的数据）
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// 此中间件用来解析cookie数据。
app.use(cookieParser());
// 设置静态资源目录，让服务器自动去public文件夹下请求静态资源（.html,.png,.jpg,声音，脚本库）
app.use(express.static(path.join(__dirname, 'public')));

// 路由中间件(各个路由模块，只有routes/users.js文件添加了详细注释，其他文件类似)
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/collages', collagesRouter);
app.use('/departs', departsRouter);
app.use('/classes', classesRouter);
app.use('/students', studentsRouter);
app.use('/courses', coursesRouter);
app.use('/scores', scoresRouter);

// 捕获404异常，当请求的页面不存在时，会进入此管线。
app.use(function (req, res, next) {
  next(createError(404));
});

// 捕获其他错误
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
});

// 导出app.js中，供bin/www文件使用。
module.exports = app;
