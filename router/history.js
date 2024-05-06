const express = require('express')
// 创建路由对象
const router = express.Router()

const {generalUpload} = require("../middlewares/multer")

//导入处理函数
const historyHandler = require('../router_handler/history_handler')

router.get('/getHistories', historyHandler.getHistories)
router.get('/getLastHistory', historyHandler.getLastHistory)
router.post('/addHistory',generalUpload.none(), historyHandler.addHistory)

module.exports = router