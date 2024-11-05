const express = require('express')
// 创建路由对象
const router = express.Router()

const {generalUpload, upload} = require("../middlewares/multer")

//导入处理函数
const jobHandler = require('../router_handler/job_handler')


router.post('/updateJob',generalUpload.none(), jobHandler.updateJob)


// Company
router.get('/getCompanyJobsByCompanyId', jobHandler.getCompanyJobsByCompanyId)


module.exports = router