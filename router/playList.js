const express = require('express')
// 创建路由对象
const router = express.Router()

const {playlist} = require("../middlewares/multer")

//导入处理函数
const playListHandler = require('../router_handler/playList_handler')


router.get('/getPlayList', playListHandler.getPlayList)
router.get('/getPlayLists', playListHandler.getPlayLists)
router.get('/getPlayListTracks', playListHandler.getPlayListTracks)
router.post('/addPlayList',playlist.single("cover"), playListHandler.addPlayList)
router.post('/addPlayListTrack', playlist.none(), playListHandler.addPlayListTrack)
router.post('/deletePlayListTracks',playlist.none(), playListHandler.deletePlayListTracks)

module.exports = router