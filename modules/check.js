function checkLogin(req, res, next) {
    if (req.cookies && req.cookies.loginName) {
        return next();
    }
    res.send({
        code: 202,
        message: '请登录'
    })
}

function getPages(page, totalPage) {
    var pages = [page]; 

    var left = page - 1; 
    var right = page + 1; 

    while (pages.length < 10 && (left >= 1 || right <= totalPage)) {
        if (left >= 1) pages.unshift(left--);
        if (right <= totalPage) pages.push(right++); 
    }
    return pages; 
}

module.exports = {
    checkLogin,
    getPages
}