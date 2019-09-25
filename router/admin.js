const express = require("express"),
    {user,task} = require("../model/schame"),
    crypto = require ("crypto"),
    router = express.Router();


router.use(function (req,res,next) {

    if(req.session.login){

        if(req.session.user.level >=1){
            return next()
        }
          return res.send("没有权限")
    }
          res.send("很抱歉，您长时间未在本系统进行操作。为保证您的使用安全，现已自动退出，请重新登录！")
});
router.get("/user",function (req,res) {

    res.render("admin/user", {
        user: req.session.user,
        title:"用户管理"
    })
}).post("/user",function (req,res) {
        //从第几个开始查找，查找到第几个
    Promise.all([
        user.find().skip((req.body.page - 1) * req.body.limit).limit(Number(req.body.limit)),
        user.countDocuments()
    ]).then(function (data) {
        res.send({code:0,data:data[0],count:data[1]})

    });
    //查找一共有多少数据
    //第一页 1  每页显示10条
    //从第几个开始查找计算方式（1-1）*10


});
//关于账号是否可用权限的路由
router.post('/user/reuserd', function (req, res) {
    // console.log(req.body.used);
    // console.log(typeof Boolean(req.body.used));
    user.findOne({_id: req.body.user_id}, function (err, data) {
        if (data.level >=999) {
            return res.send({code: 1, data: 'Sorry，此用户为系统最高权限'})
        }
        if (req.session.user.level < 999 && data.level >= 10) {
            return res.send({code: 1, data: '只有超级管理员才能修改管理员'})
        }
        if (req.session.user.level ===1) {
            return res.send({code: 1, data: '请联系管理员'})
        }
        user.updateOne({_id: req.body.user_id}, {$set: {used: req.body.used}}, function () {
            res.send({code: 0, data: '修改成功'})
        })
    });
});

//删除用户(包括文章任务)的路由
router.post('/user/del', function (req, res) {
    if (!req.body._id) {
        return res.send({code: 1, data: '参数不正确'})
    }
    user.findOne({_id: req.body._id}, function (err, data) {
        if (data.level >= 999) {
            return res.send({code: 1, data: '不能删除超级管理员'})
        }
        if (req.session.user.level < 10 && data.level >= 1) {
          return res.send({code: 1, data: '不能删除自己'})
        }
        //(data._id === req.session.user._id)
        // 管理员之见不能互相删除
        if (req.session.user.level < 999 && data.level >= 10) {
            return res.send({code: 1, data: '不能删除管理员'})
        }
        Promise.all([
            user.deleteOne({_id: req.body._id}), // 删除用户数据
            task.deleteMany({author: req.body._id}), // 删除用户发布的文章/任务
            task.updateMany({"receiver.user": req.body._id}, {$pull: {"receiver":{user: "5c5c110eba98882ad4949bb3"}}}) // 删除用户接取的任务/评论
        ]).then((data)=>{
            data && res.send({code:0,data:"用户删除成功"})
        })
            .catch(err=>{
                err && res.send({code:1,data:"用户删除失败"})
            })
    });
});
//关于更该级别修改问题 有Bug (待修复)(只有进行数据库修改)
router.post('/user/relevel', function (req, res) {
    user.updateOne({_id:req.body.user_id},{$set:{level:req.body.level}},function (err,data) {
        if (data.level >= 999) {
            return res.send({code: 1, data: '抱歉，你没有权限修改超级管理员'})
        }
        if (req.session.user.level < 999 && data.level >= 10) {
            return res.send({code: 1, data: '只有超级管理员才能修改管理员'})
        }
        user.updateOne({_id: req.body.user_id}, {$set: {level: req.body.level}}, function () {
            res.send({code: 0, data: '修改成功'})
        })
    });
});


router.get("/task/add",function (req,res) {
    res.render("admin/addtask",{
        title:"发布任务",
        user:req.session.user
    })
});


router.post("/task/add",function (req,res) {
    const data = req.body;
    data.author = req.session.user._id;
    data.time = new Date();
    task.create(data,function (err,data) {
        if(err){
            return res.send({code:1,data:"数据库错误"})
        }
        user.updateOne({_id:req.session.user._id},{$push:{"task.publish":data._id}},function(){
            res.send({code:0,data:"保存成功"})
        });
    })
});
router.get("/task/all",function (req,res) {
    res.render("admin/deltask",{
        title:"任务管理",
        user:req.session.user
    })

});




//公告须知
router.get("/task/not",function (req,res) {
    res.render("admin/notice",{
        title:"站长公告",
        user:req.session.user
    })

});
router.post("/task/not",function (req,res) {
    Promise.all([
        task.find().populate("author").skip((req.body.page - 1) * req.body.limit).limit(Number(req.body.limit)),
        task.countDocuments()
    ]).then(function (data) {
        res.send({code: 0, data: data[0], count: data[1]})

    })
});
//删除文章
router.post("/task/del",function (req,res) {
    Promise.all([
        task.deleteOne({_id:req.body._id}),
        user.updateMany(
            {$or:[{"task.publish":req.body._id},{"task.receiver":req.body._id},{"task.accomplish":req.body._id}]},
            {$pull:{"task.publish":req.body._id,"task.receiver":req.body._id,"task.accomplish":req.body._id}},
        ).then()
    ]);});







module.exports=router;
















