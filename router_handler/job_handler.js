const axios = require('axios');
const mongodb = require("../model/mongodb");
const { Company } = require('../model/schema/company');


exports.updateJob = async (req, res) => {
    try{
        const job = { ...req.body };  // 使用扩展运算符将所有字段复制到 job 中
        
        const updatedJob = await mongodb.updateJob(job)
        return res.send({ status: 200, message: 'Success', data: updatedJob})
    }catch(err){
        return res.send({ status: 1, message: err.message })
    }
};

exports.getCompanyJobsByCompanyId = async (req, res) => {
    try{
        console.log(req.user);
        
        let companyJobs = []
        if(req.query.company){
            companyJobs = await mongodb.getCompanyJobsByCompanyId(req.query.company)
        }else{
            return res.send({ status: 1, message: "Please Enter Company ID" })
        }
        
        return res.send({ status: 200, message: 'Success', data: companyJobs})
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
