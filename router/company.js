const express = require('express')
// 创建路由对象
const router = express.Router()

const {generalUpload, upload} = require("../middlewares/multer")

//导入处理函数
const companyHandler = require('../router_handler/company_handler')


router.post('/updateCompany',upload.single('logo'), companyHandler.updateCompany)

module.exports = router