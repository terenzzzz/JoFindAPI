//导入express
const express = require('express')
// 创建路由对象
const router = express.Router()

//导入处理函数
const chatHandler = require('../router_handler/chat_handler')

const {generalUpload, upload} = require("../middlewares/multer")



router.post('/createRoom', upload.none(), chatHandler.createRoom)

router.get('/getChatRoomBySeeker', chatHandler.getChatRoomBySeeker)
router.get('/getChatRoomByCompany', chatHandler.getChatRoomByCompany)


router.post('/createMsg', upload.none(), chatHandler.createMsg)
router.get('/getMsgByChatRoom', chatHandler.getMsgByChatRoom)
//共享
module.exports = router