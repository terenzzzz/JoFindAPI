const axios = require('axios');
const mongodb = require("../model/mongodb");
const { Company } = require('../model/schema/company');


exports.updateCompany = async (req, res) => {
    try{
        const body = req.body
        const company = {
            _id: body._id,
            name: body.name,
            founded: body.founded,
            industry: body.industry,
            size: body.size,
            website: body.website,
            location: body.location,
            latitude: body.latitude,
            longitude: body.longitude,
            background: body.background,
        }
        if(req.file){
            company["logo"] = fileToBase64(req.file)
        }

        const updatedCompany = await mongodb.updateCompany(req.user._id, company)
        return res.send({ status: 200, message: 'Success', data: updatedCompany})
    }catch(err){
        return res.send({ status: 1, message: err.message })
    }
};

exports.getCompanyById = async (req, res) => {
    try{
        let company = {}
        if(req.user.role == 1 && req.user.company){
            company = await mongodb.getCompanyById(req.user.company)
        }else{
            return res.send({ status: 1, message: " Not a Company Accound" })
        }
        
        return res.send({ status: 200, message: 'Success', data: company})
    }catch(err){
        return res.send({ status: 1, message: err.message })
    }
};



function fileToBase64(file){
    // 从 req.file.buffer 获取文件内容  
  const fileBuffer = file.buffer;  
  
  // 将 Buffer 转换为 Base64 编码的字符串  
  const base64String = fileBuffer.toString('base64');  

  return base64String
}
