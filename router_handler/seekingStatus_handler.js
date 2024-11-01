const axios = require('axios');
const mongodb = require("../model/mongodb");


exports.getSeekingStatus = async (req, res) => {
    try{
        const seekingStatus = await mongodb.getSeekingStatus()
        return res.send({ status: 200, message: 'Success', data: seekingStatus})
    }catch(err){
        return res.send({ status: 1, message: err.message })
    }
};


