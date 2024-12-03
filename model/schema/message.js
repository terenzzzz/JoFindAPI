const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    chatroom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chatroom',  // 关联到 Chatroom 集合
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',  // 发送者用户ID
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
    {
      timestamps: true
  }
);



module.exports = {
  Message: mongoose.model('Message', messageSchema)
}