const express = require('express')
// 创建路由对象
const router = express.Router()

//导入处理函数
const userHandler = require('../router_handler/user_handler')

router.get('/getUser', userHandler.getUser)

module.exports = router