//导入express
const express = require('express')
// 创建路由对象
const router = express.Router()

//导入处理函数
const tagHandler = require('../router_handler/tag_handler')

router.get('/getAllTags', tagHandler.getAllTags)
router.get('/getAllYears', tagHandler.getAllYears)




//共享
module.exports = router