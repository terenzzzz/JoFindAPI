
const mongodb = require("../model/mongodb")


// 获取RecommArtist
exports.getAllTags = async (req, res) => {
  try{
    const tags = await mongodb.getAllTags(req.query.limit)
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


