//导入express
const express = require('express')
// 创建路由对象
const router = express.Router()

//导入处理函数
const dataHandler = require('../router_handler/data_handler')

router.get('/queryMetadata', dataHandler.queryMetadata)
router.get('/queryNetEase', dataHandler.queryNetEase)
router.get('/queryLyric', dataHandler.queryLyric)
router.get('/queryCover', dataHandler.queryCover)
router.get('/getTracksTags', dataHandler.getTracksTags)
router.get('/getArtistsTags', dataHandler.getArtistsTags)
router.get('/getArtistsCover', dataHandler.getArtistsCover)

//共享
module.exports = router