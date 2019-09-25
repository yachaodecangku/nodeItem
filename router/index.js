
const express = require("express"),
     session = require("express-session"),
    {user,task} = require("../model/schame"),
    crypto = require ("crypto"),
    router = express.Router();
/*
  状态码
  0  成功
  1  失败
  2  服务器错误
  3  其他...
*/

router.get("/reg",function (req,res) {
    res.render("reg",{
        title:"注册"
        })
}).post('/reg', function (req, res) {
    //console.log(req.body);
    user.findOne({username: req.body.username}).then((data)=>{
        if(data){
            return res.send({
                code :1,
                msg  :"用户已存在",
            })}
        //1 指定用什么方式进行加密
        const c = crypto.createHash("sha256");
        //2 加密
        const password = c.update(req.body.password).digest("hex");
        user.create({
            username:req.body.username,
            password:password
        }).then((data)=>{
            res.send({code:0,msg:"注册成功"})
        })
    })
});

router.get("/login",function (req,res) {
    // console.log(req.session.login);
    res.render("login",{
        login:req.session.login,
        title:"登录"
    });}).post("/login",function (req,res) {
    //1 判断用户存在不存在
    user.findOne({username:req.body.username},function (err,data) {
        if(data){
            const c = crypto.createHash("sha256");
            const password = c.update(req.body.password).digest("hex");
            if(data.password === password){
                req.session.login = true;
                req.session.user = data;
                return res.send({code:0,msg:"登录成功"})
            }
            return res.send({msg:"密码错误"})
        }
        res.send({msg:"用户不存在"})
    })

})
router.get("/logout",function (req,res) {
    req.session.destroy(),//清除session
    res.redirect("/")//重定向回到登录界面

})
router.get("/",function (req,res) {
    res.render("index",{
        login:req.session.login,
        user :req.session.user,
        title:"首页"
    })
});

// 给所有的路由设置, 在想设置的路由前面

/*router.use(function (req, res, next) {
    if (req.session.user.level >= 10) {
        return next()
    }
    res.send("很抱歉没有权限");
});
// 给单独的某一个路由设置
/*router.get('/admin', function (req, res, next) {
  if (req.session.user.level >= 10) {
    return next()
  }
  res.send('没有权限');
}, function (req, res) {
  res.send('假装这里是后台')
});*/

/*router.get('/admin', function (req, res){
    res.send('假装这里是后台')
});*/
router.get('/xq/:id', function (req, res) {
    task.findOne({_id: req.params.id}).populate('author receiver.user').exec(function (err, data) {
        //console.log(data);
        const a = data.receiver.findIndex(function (val) {
            // 如果等于 代表当前登录的用户 在已经接取的数组里
            // // -1 没有接取  其他所有 已经几区
            return String(val._id) === req.session.user && req.session.user._id

        });
        res.render('xq', {
            title: '详情页 - ' + data.title,
            user: req.session.user,
            login: req.session.login,
            data: data,
            a
        })
    })
});
router.post('/xq/:id', function (req, res) {
    // if( req.session.login){
    //     return res.send({})
    // }
    // user.findOne({_id:req.session.user._id},function (err,data) {
    //     const a = data.receiver.findIndex(function (val) {
    //        return String(val._id)=== req.params.id
    //     });
    //     if(!(a === -1)){
    //         res.send()
    //     }
        Promise.all([
            task.updateOne({_id: req.params.id}, {$push: {receiver: {user: req.session.user._id} }}),
            user.updateOne({_id: req.session.user._id}, {$push: {'task.receive': req.params.id}})
        ]);

    // });5c5c110eba98882ad4949bb3

});
router.post('/task/finmsg', function (req, res) {
    task.updateOne({_id:"5c66d23384295942cb0f50d5"},
        {$set: {
                ['receiver.' + req.body.index + '.msg']: req.body.msg},
            ['receiver.' + req.body.index + '.finmsg']: true
        }).then()
});


module.exports=router;



















