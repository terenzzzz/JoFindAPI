const express = require('express')
// 创建路由对象
const router = express.Router()


//导入处理函数
const geniusHandler = require('../router_handler/genius_handler')

router.get('/getLyricsFromGenius', geniusHandler.getLyricsFromGenius)


module.exports = router