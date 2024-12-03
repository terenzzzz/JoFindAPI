const mongoose = require('mongoose');

const chatroomSchema = new mongoose.Schema({
    seeker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // 发送者用户ID
        required: true,
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',  // 发送者用户ID
        required: true,
      },
},
{
    timestamps: true
}
);


module.exports = {
    Chatroom: mongoose.model('Chatroom', chatroomSchema)
}