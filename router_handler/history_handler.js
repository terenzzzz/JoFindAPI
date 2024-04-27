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

exports.getLastHistory = async (req, res) => {
  try {
    // 获取用户的历史记录
    const histories = await mongodb.getHistories(req.user._id);
    
    // 检查是否有历史记录
    if (histories.length > 0) {
      // 如果有历史记录，返回最后一条历史记录
      const lastHistory = histories[histories.length - 1];
      return res.send({ status: 200, message: 'Success', data: lastHistory });
    } else {
      // 如果没有历史记录，返回空数据
      return res.send({ status: 200, message: 'No history found', data: null });
    }
  } catch (err) {
    // 如果出现错误，返回错误信息
    return res.send({ status: 1, message: err.message });
  }
};
