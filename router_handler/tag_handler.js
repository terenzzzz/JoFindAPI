
const mongodb = require("../model/mongodb")
const LASTFM_API_KEY = process.env.LASTFM_API_KEY 
const axios = require('axios');

exports.getAllTags = async (req, res) => {
  try{
    const limit = req.query.limit? req.query.limit : 100
    const tags = await mongodb.getAllTags(limit)
    return res.send({ status: 200, message: 'Success', data: tags})
  }catch(err){
    return res.send({ status: 1, message: err.message })
  }
};

exports.getAllYears = async (req, res) => {
  try{
    const years = await mongodb.getAllYears(req.query.limit)
    return res.send({ status: 200, message: 'Success', data: years})
  }catch(err){
    return res.send({ status: 1, message: err.message })
  }
};

exports.getTagById = async (req, res) => {
  try{
    const tag = await mongodb.getTagById(req.query.tag)
    return res.send({ status: 200, message: 'Success', data: tag})
  }catch(err){
    return res.send({ status: 1, message: err.message })
  }
};

exports.searchTags = async (req, res) => {
  try{
    const tags = await mongodb.getTagsByKeyword(req.query.keyword)
    return res.send({ status: 200, message: 'Success', data: tags})
  }catch(err){
    return res.send({ status: 1, message: err.message })
  }
};


exports.getTrackTagsFromLastfm = async (artist,track) => {
  var tags = []
  const response = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=track.gettoptags&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&api_key=${LASTFM_API_KEY}&format=json`);
  if (response.data.toptags){
    tags = response.data.toptags.tag.slice(0, 10); 
    tags = tags.map(obj => {
      // 使用解构赋值去掉 'url' 键值对
      const { url, ...rest } = obj;
      return rest;
    });
  }
  return tags
}

exports.getArtistTagsFromLastfm = async (artist) => {
  var tags = []
  const response = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=artist.gettoptags&artist=${encodeURIComponent(artist)}&api_key=${LASTFM_API_KEY}&format=json`);
  if (response.data.toptags){
    tags = response.data.toptags.tag.slice(0, 10); 
    tags = tags.map(obj => {
      // 使用解构赋值去掉 'url' 键值对
      const { url, ...rest } = obj;
      return rest;
    });
  }
  return tags
}

