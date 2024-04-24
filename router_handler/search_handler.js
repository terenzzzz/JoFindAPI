const logger = require('../utils/logger');
const axios = require('axios');
const mongodb = require("../model/mongodb");



exports.search = async (req, res) => {
  try{
    const tracks = await mongodb.search(req.query.keyword)
    return res.send({ status: 200, message: 'Success', data: tracks})
  }catch(err){
      return res.send({ status: 1, message: err.message })
  }
};




