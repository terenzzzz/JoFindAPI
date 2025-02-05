const express = require('express')
// 创建路由对象
const router = express.Router()

const {generalUpload, upload} = require("../middlewares/multer")

//导入处理函数
const applicationHandler = require('../router_handler/application_handler')


router.get('/getApplicationByJob', applicationHandler.getApplicationByJob)
router.get('/getApplicationByUser', applicationHandler.getApplicationByUser)
router.get('/getApplicationByCompany', applicationHandler.getApplicationByCompany)
router.post('/addApplication',generalUpload.none(), applicationHandler.addApplication)
router.post('/updateApplicationStep',generalUpload.none(), applicationHandler.updateApplicationStep)
router.post('/updateApplicationClosed',generalUpload.none(), applicationHandler.updateApplicationClosed)


module.exports = router