//导入express
const express = require('express')
// 创建路由对象
const router = express.Router()

const {generalUpload} = require("../middlewares/multer")

//导入处理函数
const recommendHandler = require('../router_handler/recommend_handler')


router.get('/get2dModel',recommendHandler.get2dModel)
router.get('/getSimilarWords',recommendHandler.getSimilarWords)


//共享
module.exports = router