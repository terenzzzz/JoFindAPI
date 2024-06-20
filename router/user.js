const express = require('express')
// 创建路由对象
const router = express.Router()


const {generalUpload} = require("../middlewares/multer")

//导入处理函数
const userHandler = require('../router_handler/user_handler')

router.get('/getUser', userHandler.getUser)
router.post('/updateSpotifyRefreshToken',generalUpload.none(), userHandler.updateSpotifyRefreshToken)
router.post('/updateTags',generalUpload.none(), userHandler.updateTags)

module.exports = router