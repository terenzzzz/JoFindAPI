const axios = require('axios');
const mongodb = require("../model/mongodb");
const { log } = require('../utils/logger');


exports.getUser = async (req, res) => {
    try{
        let user_id = req.user._id
        const user = await mongodb.getUser(user_id)
        return res.send({ status: 200, message: 'Success', data: user})
    }catch(err){
        return res.send({ status: 1, message: err.message })
    }
};

exports.updateSpotifyRefreshToken = async (req, res) => {
    try{
        let user_id = req.user._id
        let token = req.body.refreshToken
        console.log("token: " + token);
        const user = await mongodb.updateSpotifyRefreshToken(user_id,token)
        return res.send({ status: 200, message: 'Success', data: user})
    }catch(err){
        return res.send({ status: 1, message: err.message })
    }
};
