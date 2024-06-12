
const mongodb = require("../model/mongodb")


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


