const express = require('express'),
    router = express.Router(),
    {user, task} = require('../model/schame'),
    path = require('path');
    multer = require('multer');
/*console.log(__dirname);
console.log(process.cwd());*/
const storage = multer.diskStorage({
    // 1. __dirname 当前文件所在的目录
    // 2. process.cwd() node工作目录
    destination: path.join(process.cwd(), 'public/upload'),
    filename: function (req, file, callback) {
        const h = file.originalname.split('.');
        const filename = `goudan${Date.now()}.${h[h.length - 1]}`;
        callback(null, filename)
    }
});
const fileFilter = function (req, file, cb) {
    // 当设置这个的时候  没有允许(没有设置的)就是拒绝
    //
   //console.log(1);
    if (file.mimetype === 'image/gif' ||file.mimetype === 'image/jpeg'||file.mimetype === 'image/png'||file.mimetype === 'image/bmp' ||file.mimetype === 'image/tiff'){
        req.goudan = 123;
        cb(null, true)
    }
};
// 前端 -> nginx/阿帕奇 -> 后台
const upload = multer({
    storage,
    fileFilter
});

router.post('/upload', function (req, res) {
    // 1. 指定保存到那个目录
    // username: 123   pass: 34
    upload.single('file')(req, res, function (err) {
        //console.log(req.goudan);
        if (err) {
            return res.send({code: 1})
        }
        res.send({code: 0, data: {
                src: `/upload/${req.file.filename}`
            }})
    })
});
//原先这条路由是写在admin.js 里面的
router.post('/task/all', function (req, res) {
    Promise.all([
        task.find().populate('author').sort({_id: -1})
            .skip((req.body.page - 1) * req.body.limit).limit(Number(req.body.limit)),
        task.countDocuments()
    ]).then(function (data) {
        res.send({code: 0, data: data[0], count: data[1]})
    })
});
router.post("/task/del",function (req,res) {
    Promise.all([
        task.deleteOne({_id:req.body._id}),
        user.updateMany(
            {$or:[{"task.publish":req.body._id},{"task.receiver":req.body._id},{"task.accomplish":req.body._id}]},
            {$pull:{"task.publish":req.body._id,"task.receiver":req.body._id,"task.accomplish":req.body._id}},
        ).then()
    ]);


});

router.post('/task/can', function (req, res) {
    // false 代表可以接取
    Promise.all([
        task.find({can: false}).populate('author').sort({_id: -1})
            .skip((req.body.page - 1) * req.body.limit).limit(Number(req.body.limit)),
        task.countDocuments({can: false})
    ]).then(function (data) {
        res.send({code: 0, data: data[0], count: data[1]})
    })
});
router.post('/task/notcan', function (req, res) {
    // true 代表不可以接取
    // 1 后台进行1次  100
    Promise.all([
        task.find({can: true}).populate('author').sort({_id: -1})
            .skip((req.body.page - 1) * req.body.limit).limit(Number(req.body.limit)),
        task.countDocuments({can: true})
    ]).then(function (data) {
        res.send({code: 0, data: data[0], count: data[1]})
    })
});
router.post('/task/my', function (req, res) {
    user.findOne({_id: req.session.user._id})
        .populate({
            path: 'task.publish',
            options: {
                sort: {_id: -1},
                skip: (req.body.page - 1) * req.body.limit,
                limit: Number(req.body.limit)
            }
        }).then(function (data) {
        // console.log(data);
        res.send({code: 0, data: data.task.publish, count: data.task.publish.length})
    })
});
router.post('/task/ing', function (req, res) {
    user.findOne({_id: req.session.user._id})
        .populate({
            path: 'task.receive',
            options: {
                sort: {_id: -1},
                skip: (req.body.page - 1) * req.body.limit,
                limit: Number(req.body.limit)
            }
        }).then(function (data) {
        res.send({code: 0, data: data.task.receive, count: data.task.receive.length})
    })
});
router.post('/task/fin', function (req, res) {
    user.findOne({_id: req.session.user._id})
        .populate({
            path: 'task.accomplish',
            options: {
                sort: {_id: -1},
                skip: (req.body.page - 1) * req.body.limit,
                limit: Number(req.body.limit)
            }
        }).then(function (data) {
        res.send({code: 0, data: data.task.accomplish, count: data.task.accomplish.length})
    })
});




module.exports = router;
