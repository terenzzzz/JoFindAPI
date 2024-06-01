//导入express
const express = require('express')
// 创建路由对象
const router = express.Router()

//导入处理函数
const spotifyHandler = require('../router_handler/spotify_handler')


router.get('/spotifyLogin', spotifyHandler.login)
router.get('/spotifyCallback', spotifyHandler.callback)
router.get('/spotifyRefreshToken', spotifyHandler.refresh_token)



//共享
module.exports = router