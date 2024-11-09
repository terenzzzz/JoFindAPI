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

exports.getJobsByCompanyId = async (req, res) => {
    try{        
        let companyJobs = []
        if(req.query.company){
            companyJobs = await mongodb.getJobsByCompanyId(req.query.company)
        }else{
            return res.send({ status: 1, message: "Please Enter Company ID" })
        }
        
        return res.send({ status: 200, message: 'Success', data: companyJobs})
    }catch(err){
        return res.send({ status: 1, message: err.message })
    }
};

exports.getJobs = async (req, res) => {
    try{

        let jobs = await mongodb.getJobs(req.query.company)
        
        return res.send({ status: 200, message: 'Success', data: jobs})
    }catch(err){
        return res.send({ status: 1, message: err.message })
    }
};

exports.deleteJob = async (req, res) => {
    try{
    
        deletedJob = await mongodb.deleteJob(req.query.job)
        
        return res.send({ status: 200, message: 'Success', data: deletedJob})
    }catch(err){
        return res.send({ status: 1, message: err.message })
    }
};