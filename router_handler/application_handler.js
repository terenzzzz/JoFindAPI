const axios = require('axios');
const mongodb = require("../model/mongodb");



exports.addApplication = async (req, res) => {
    try{
        const application = { ...req.body };        
        const addedApplication = await mongodb.addApplication(req.user._id, application)
        if (addedApplication){
            return res.send({ status: 200, message: 'Success', data: addedApplication})
        }else{
            return res.send({ status: 1, message: 'Current user already apply this job' })
        }
        
    }catch(err){
        return res.send({ status: 1, message: err.message })
    }
};

exports.updateApplicationStep = async (req, res) => {
    try{
        const updatedApplication = await mongodb.updateApplicationStep(req.body.application, req.body.step)
        return res.send({ status: 200, message: 'Success', data: updatedApplication})
    }catch(err){
        return res.send({ status: 1, message: err.message })
    }
};

exports.updateApplicationClosed = async (req, res) => {
    try{
        const updatedApplication = await mongodb.updateApplicationClosed(req.body.application, req.body.isClosed)
        return res.send({ status: 200, message: 'Success', data: updatedApplication})
    }catch(err){
        return res.send({ status: 1, message: err.message })
    }
};

exports.getApplicationByJob = async (req, res) => {
    try{
        const job = await mongodb.getApplicationByJob(req.user._id, req.query.job)
        
        res.send({ status: 200, message: 'Success', data: job})
    }catch(err){
        return res.send({ status: 1, message: err.message })
    }
};

exports.getApplicationByUser = async (req, res) => {
    try{
        const applications = await mongodb.getApplicationByUser(req.user._id)
        
        res.send({ status: 200, message: 'Success', data: applications})
    }catch(err){
        return res.send({ status: 1, message: err.message })
    }
};

exports.getApplicationByCompany = async (req, res) => {
    try{
        const applications = await mongodb.getApplicationByCompany(req.user.company)
        
        res.send({ status: 200, message: 'Success', data: applications})
    }catch(err){
        return res.send({ status: 1, message: err.message })
    }
};

