const mongodb = require("../model/mongodb")


exports.addRating = async (req, res) => {
    try{
        let item = {
            item: req.body.item,  // 或 artistId
            itemType: req.body.itemType,  // enum: ['Track', 'Artist']
            rate: parseInt(req.body.rate),
            user: req.user._id
          }
        const newRating = await mongodb.addRating(item)
        if (newRating._id){
            return res.send({ status: 200, message: 'Success', data: newRating})
        }
        return res.send({ status: 1, message: newRating.message})
    }catch(err){
        return res.send({ status: 1, message: err.message })
    }
};

exports.getRating = async (req, res) => {
  try {
    // 获取用户的历史记录
    const rating = await mongodb.getRating(req.user._id, req.query.item, req.query.itemType);

    
    // 检查是否有历史记录
    if (rating._id) {
      return res.send({ status: 200, message: 'Success', data: rating });
    } else {
      return res.send({ status: 1, message: 'Can not found the rating record' });
    }
  } catch (err) {
    // 如果出现错误，返回错误信息
    return res.send({ status: 1, message: err.message });
  }
};


