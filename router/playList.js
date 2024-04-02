const express = require('express')
// 创建路由对象
const router = express.Router()

const {playlist} = require("../middlewares/multer")

//导入处理函数
const playListHandler = require('../router_handler/playList_handler')


router.get('/getPlayList', playListHandler.getPlayList)
router.get('/getPlayLists', playListHandler.getPlayLists)
router.post('/addPlayList',playlist.single("cover"), playListHandler.addPlayList)

module.exports = router