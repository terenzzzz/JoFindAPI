const express = require('express')
// 创建路由对象
const router = express.Router()



//导入处理函数
const seekingStatusHandler = require('../router_handler/seekingStatus_handler')


router.get('/getSeekingStatus', seekingStatusHandler.getSeekingStatus)

module.exports = router