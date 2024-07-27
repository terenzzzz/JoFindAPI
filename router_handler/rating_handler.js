const { itemTypes } = require("../model/enum/itemTypes");
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

exports.deleteRating = async (req, res) => {
  try {
      const { user, item } = req.body; // 从请求体中获取user和item

      if (!user || !item) {
          return res.status(400).send({ status: 1, message: 'User and item are required.' });
      }

      const deletedRating = await mongodb.deleteRating(user, item);

      if (deletedRating) {
          return res.status(200).send({ status: 200, message: 'Success', data: deletedRating });
      } else {
          return res.status(404).send({ status: 1, message: 'Rating not found.' });
      }
  } catch (err) {
      return res.status(500).send({ status: 1, message: err.message });
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

exports.getRatings = async (req, res) => {
  try{
    const ratings = await mongodb.getRatings(req.user._id)

    let ratedTracks=[]
    let ratedArtists=[]

    ratings.forEach(item => {
      if (item.itemType === itemTypes.TRACK) {
        ratedTracks.push(item);
      } else if (item.itemType === itemTypes.ARTIST) {
        ratedArtists.push(item);
      }
    });


    return res.send({ status: 200, message: 'Success', data: {ratedTracks,ratedArtists}})
  }catch(err){
    return res.send({ status: 1, message: err.message })
  }
};

