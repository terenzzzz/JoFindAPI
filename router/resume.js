const express = require('express')
// 创建路由对象
const router = express.Router()


const {generalUpload, upload} = require("../middlewares/multer")
//导入处理函数
const resumeRouter = require('../router_handler/resume_handler')

router.get('/getResume', resumeRouter.getResume)
router.get('/getResumeByUser', resumeRouter.getResumeByUser)

router.post('/updateResume', upload.single('avatar'), resumeRouter.updateResume)

module.exports = router