//导入express
const express = require('express')
// 创建路由对象
const router = express.Router()

const {generalUpload} = require("../middlewares/multer")

//导入处理函数
const ratingHandler = require('../router_handler/rating_handler')


router.post('/addRating', generalUpload.none(), ratingHandler.addRating)
router.get('/getRating',ratingHandler.getRating)
router.get('/getRatings',ratingHandler.getRatings)


//共享
module.exports = router