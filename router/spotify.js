//导入express
const express = require('express')
// 创建路由对象
const router = express.Router()

//导入处理函数
const spotifyHandler = require('../router_handler/spotify_handler')


router.get('/spotifyLogin', spotifyHandler.login)
router.get('/spotifyCallback', spotifyHandler.callback)
router.get('/spotifyRefreshToken', spotifyHandler.refresh_token)

router.get('/getRecentlyPlayed', spotifyHandler.recentlyPlayed)
router.get('/getTopTracks', spotifyHandler.topTracks)
router.get('/getTopArtists', spotifyHandler.topArtists)
router.get('/search', spotifyHandler.search)



//共享
module.exports = router