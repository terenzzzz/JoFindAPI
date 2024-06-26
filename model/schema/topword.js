const mongoose = require('mongoose');

const topWordSchema = new mongoose.Schema({
    track: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Track',
      required: true
    },
    topwords: {
        type: [String], // 假设topwords是一个字符串数组
        required: true
    }
  }, { timestamps: true });

module.exports = {
    TopWord: mongoose.model('TopWord', topWordSchema)
}