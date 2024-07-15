//导入express
const express = require('express')
// 创建路由对象
const router = express.Router()

const {generalUpload} = require("../middlewares/multer")

//导入处理函数
const recommendHandler = require('../router_handler/recommend_handler')

router.get('/getTfidfSimilarity', recommendHandler.getTfidfSimilarity)
router.get('/getW2VSimilarity', recommendHandler.getW2VSimilarity)

router.get('/get2dModel',recommendHandler.get2dModel)
router.get('/getSimilarWords',recommendHandler.getSimilarWords)
router.get('/getLdaSimilarity',recommendHandler.getLdaSimilarity)
router.get('/getWeightedSimilarity',recommendHandler.getWeightedSimilarity)

router.get('/getTfidfRecommend',recommendHandler.getTfidfRecommend)


//共享
module.exports = router