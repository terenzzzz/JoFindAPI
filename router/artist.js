//导入express
const express = require('express')
// 创建路由对象
const router = express.Router()

//导入处理函数
const artistHandler = require('../router_handler/artist_handler')

router.get('/getRecommArtist', artistHandler.getRecommArtist)


//共享
module.exports = router