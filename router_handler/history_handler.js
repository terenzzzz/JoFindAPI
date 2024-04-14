const mongodb = require("../model/mongodb")


// 获取RecommArtist
exports.getHistories = async (req, res) => {
  try{
    const histories = await mongodb.getHistories(req.user._id)
    return res.send({ status: 200, message: 'Success', data: histories})
  }catch(err){
    return res.send({ status: 1, message: err.message })
  }
};

