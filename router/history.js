const express = require('express')
// 创建路由对象
const router = express.Router()

//导入处理函数
const historyHandler = require('../router_handler/history_handler')

router.get('/getHistories', historyHandler.getHistories)

module.exports = router