//导入express
const express = require('express')
// 创建路由对象
const router = express.Router()

//导入处理函数
const searchHandler = require('../router_handler/search_handler')

router.get('/search', searchHandler.search)


//共享
module.exports = router