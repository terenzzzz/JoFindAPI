//导入express
const express = require('express')
// 创建路由对象
const router = express.Router()

//导入处理函数
const spotifyHandler = require('../router_handler/spotify_handler')

router.get('/getTop5', spotifyHandler.getTop5)


//共享
module.exports = router