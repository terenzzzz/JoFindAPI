//导入express
const express = require('express')
// 创建路由对象
const router = express.Router()
const {generalUpload} = require("../middlewares/multer")

//导入处理函数
const tracksHandler = require('../router_handler/tracks_handler')

router.get('/getRandomTracks', tracksHandler.getRandomTracks)
router.get('/getLyricTopWords', tracksHandler.getLyricTopWords)
router.get('/getTracks', tracksHandler.getTracks)
router.get('/getDailyRecomm', tracksHandler.getDailyRecomm)
router.get('/getResonanace', tracksHandler.getResonanace)
router.get('/getMoodVibe', tracksHandler.getMoodVibe)
router.get('/getSceneRhythm', tracksHandler.getSceneRhythm)
router.get('/getRecentlyPlayed', tracksHandler.getRecentlyPlayed)
router.get('/getTracksByArtist', tracksHandler.getTracksByArtist)
router.get('/getTrackById', tracksHandler.getTrackById)
router.get('/getTracksByTag', tracksHandler.getTracksByTag)
router.get('/getTracksByTags', tracksHandler.getTracksByTags)

router.get('/getTrackTopic', tracksHandler.getTrackTopic)
router.post('/getTrackTopicByLyric', generalUpload.none(), tracksHandler.getTrackTopicByLyric)
router.post('/getLyricTopWordsByLyric', generalUpload.none(), tracksHandler.getLyricTopWordsByLyric)


//共享
module.exports = router