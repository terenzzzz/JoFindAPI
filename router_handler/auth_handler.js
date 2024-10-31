
// 导入加密模块
const bcrypt = require('bcryptjs')
const joi = require('joi')

// 导入生成 Token 字符串的包
const jwt = require('jsonwebtoken')
// 导入配置文件 
const config = require('../config')
const mongodb = require('../model/mongodb')

// 注册用户的处理函数
exports.register = async (req, res) => {
    // 密码规则: 8-16个字符，至少1个大写字母，1个小写字母和1个数字
    const requestUser = req.body


    // 检测是否被占用
    try{
        var user = await mongodb.getUserByEmail(requestUser.email)
        if (user){
            logger.log("邮箱被占用，请更换其他用户名！",req.body)
            return res.cc('邮箱被占用，请更换其他用户名！')
        }
        if (requestUser.password != requestUser.confirmPassword) {
            logger.log("输入的两次密码不一致！",req.body)
            return res.cc('输入的两次密码不一致！')
        }

        var newUser = {
            name: requestUser.name,
            email: requestUser.email,
            password: bcrypt.hashSync(requestUser.password, 10),
            avatar: req.file? fileToBase64(req.file) : "",
            role: requestUser.role
        }

        var savedUser = await mongodb.addUser(newUser)

        if(savedUser){
            return res.send({ status: 200, message: '注册成功' })
        }else{
            return res.cc('注册失败')
        }
        
    }catch(e){
        return res.cc('注册失败')
    }

}

// 登录的处理函数
exports.login = async (req, res) => {
    const requestUser = req.body
    var user = await mongodb.getUserByEmail(requestUser.email)

    if(user){
        const compareResult = bcrypt.compareSync(requestUser.password, user.password)
        if (!compareResult) {
            return res.cc('密码错误,登录失败！')
        }
        // 密码正确
        
        const { password, ...userInfo } = user.toObject();

        //生成Token
        const tokenStr = jwt.sign(userInfo, config.jwtSecretKey, {})
        return res.send({
            status: 200,
            message: '登录成功！',
            user: {...userInfo},
            // 为了方便客户端使用 Token，在服务器端直接拼接上 Bearer 的前缀 
            token: 'Bearer ' + tokenStr,
        })

    }else{
        return res.cc('登录失败！')
    }
}

function fileToBase64(file){
    // 从 req.file.buffer 获取文件内容  
  const fileBuffer = file.buffer;  
  
  // 将 Buffer 转换为 Base64 编码的字符串  
  const base64String = fileBuffer.toString('base64');  

  return base64String
}
