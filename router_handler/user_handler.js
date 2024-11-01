const axios = require('axios');
const mongodb = require("../model/mongodb");


exports.getUser = async (req, res) => {
    try{
        let user_id = req.user._id
        const user = await mongodb.getUser(user_id)
        return res.send({ status: 200, message: 'Success', data: user})
    }catch(err){
        return res.send({ status: 1, message: err.message })
    }
};


