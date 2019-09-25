
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username:{type:String, required:true},
    password:{type: String,required:true},
    used:{type:Boolean,default:false,required:true,default:true},//账号是否可用
    level:{type:Number,required:true,default:1}, //账号权限 普通用户  管理员10 超级管理员 999 //普通用户 ，Vip
    //任务状态
    task:{
        //发布的任务
        publish:{type:[{type:mongoose.Schema.Types.ObjectId,ref:"task"}]},
        //已经接取的任务
        receive:{type:[{type:mongoose.Schema.Types.ObjectId,ref:"task"}]},
        //已经完成的
        accomplish:{type:[{type:mongoose.Schema.Types.ObjectId,ref:"task"}]}
    }
});
//任务详情
const taskSchema = new mongoose.Schema({
    title:{type:String},//标题
    content:{type:String},//内容
    author:{type:mongoose.Schema.Types.ObjectId,ref:"user"},//作者
    receiver: {type: [ {
            user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
            msg: {type: String},
            finmsg: {type: Boolean, default: false} // 当前用户完成任务
        } ]}, // 接取人
    time:{type:String},//发布时间
    num:{type:Number},//接受人数限制
    reward:{type:String},//奖励
    difficulty:{type:String},//难度星级
    date:{type:String}, //截止日期
    can: {type: Boolean, required: true, default: false}// 任务是否已经完成






});
//创建表
const user = mongoose.model("user",userSchema);
const task = mongoose.model("task",taskSchema);


module.exports ={
    user,
    task
};





















