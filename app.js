
const express = require("express"),
    app = express(),
    session = require("express-session"),
    Mongosession = require("connect-mongo")(session),
 mongoose =require("mongoose");
//连接数据库
mongoose.connect("mongodb://localhost/a",{ useNewUrlParser: true });
 app.use(session({
   secret:"zheyang", //密钥  加密Cookie(id)
     rolling:true,   //每次操作页面  点击A标签  自动延长时间
     receive:false,   //是否每次请求都重新保存数据
     saveUninitialized:false, //初始值 ，
     cookie:{maxAge:1000*60*60},
     store:new Mongosession({
         url:"mongodb://localhost/a"
     })
}));
//获取post参数
 app.use(express.json());
 app.use(express.urlencoded({extended:false}));
 //静态资源目录
app.use(express.static(__dirname +"/public"));
//模板引擎

app.set('views', __dirname + '/view');
app.set('view engine', 'ejs');
app.use("/api",require("./router/api"));
app.use("/",require("./router/index.js"));
app.use('/admin', require('./router/admin.js'));


app.listen(80);



















