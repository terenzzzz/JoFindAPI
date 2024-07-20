//导入express
const express = require('express')
// 创建路由对象
const router = express.Router()

const {generalUpload} = require("../middlewares/multer")

//导入处理函数
const recommendHandler = require('../router_handler/recommend_handler')

router.get('/get2dModel',recommendHandler.get2dModel)
router.get('/getSimilarWords',recommendHandler.getSimilarWords)

router.get('/getTfidfRecommendByTrack', recommendHandler.getTfidfRecommendByTrack)
router.get('/getW2VRecommendByTrack', recommendHandler.getW2VRecommendByTrack)
router.get('/getLdaRecommendByTrack',recommendHandler.getLdaRecommendByTrack)
router.get('/getWeightedRecommendByTrack',recommendHandler.getWeightedRecommendByTrack)

router.post('/getTfidfRecommendByLyrics',generalUpload.none(),recommendHandler.getTfidfRecommendByLyrics)
router.post('/getW2VRecommendByLyrics',generalUpload.none(),recommendHandler.getW2VRecommendByLyrics)
router.post('/getLDARecommendByLyrics',generalUpload.none(),recommendHandler.getLDARecommendByLyrics)
router.post('/getWeightedRecommendByLyrics',generalUpload.none(),recommendHandler.getWeightedRecommendByLyrics)

router.post('/getTfidfRecommendArtistsByArtist',generalUpload.none(),recommendHandler.getTfidfRecommendArtistsByArtist)
router.post('/getW2VRecommendArtistsByArtist',generalUpload.none(),recommendHandler.getW2VRecommendArtistsByArtist)
router.post('/getLDARecommendArtistsByArtist',generalUpload.none(),recommendHandler.getLDARecommendArtistsByArtist)
router.post('/getWeightedRecommendArtistsByArtist',generalUpload.none(),recommendHandler.getWeightedRecommendArtistsByArtist)

//共享
module.exports = router