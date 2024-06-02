const sqlite3 = require('sqlite3');
const db = require('../db/index')
const logger = require('../utils/logger');
const axios = require('axios');
const mongodb = require("../model/mongodb")


// 获取RecommArtist
exports.getRecommArtist = async (req, res) => {
  try{
    const artists = await mongodb.getRandomArtists()
    return res.send({ status: 200, message: 'Success', data: artists})
  }catch(err){
    return res.send({ status: 1, message: err.message })
  }
};

// 获取Artist
exports.getArtist = async (req, res) => {
  try{
    const artists = await mongodb.getArtist(req.query.id)
    
    return res.send({ status: 200, message: 'Success', data: artists})
  }catch(err){
    return res.send({ status: 1, message: err.message })
  }
};

// 根据查询的artist返回类似的.
exports.getSimilarArtists = async (req, res) => {
  try{
    const artists = await mongodb.getRandomArtists()
    return res.send({ status: 200, message: 'Success', data: artists})
  }catch(err){
    return res.send({ status: 1, message: err.message })
  }
};






