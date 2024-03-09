//导入express
const express = require('express')
// 创建路由对象
const router = express.Router()

//导入处理函数
const tracksHandler = require('../router_handler/tracks_handler')


router.get('/getTracks', tracksHandler.getTracks)
router.get('/getDailyRecomm', tracksHandler.getDailyRecomm)
router.get('/getResonanace', tracksHandler.getResonanace)
router.get('/getMoodVibe', tracksHandler.getMoodVibe)
router.get('/getSceneRhythm', tracksHandler.getSceneRhythm)
router.get('/getRecentlyPlayed', tracksHandler.getRecentlyPlayed)


//共享
module.exports = router