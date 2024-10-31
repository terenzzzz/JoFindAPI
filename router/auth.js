//导入express
const express = require('express')
// 创建路由对象
const router = express.Router()

//导入处理函数
const authHandler = require('../router_handler/auth_handler')

// 导入验证表单数据的中间件 
const expressJoi = require('@escook/express-joi')
// 导入需要的验证规则对象
const { user_schema } = require('../schema/user')

const {generalUpload, upload} = require("../middlewares/multer")



router.post('/register', expressJoi(user_schema),upload.single('avatar'), authHandler.register)

router.post('/login', expressJoi(user_schema), authHandler.login)


//共享
module.exports = router