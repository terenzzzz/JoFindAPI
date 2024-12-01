// // socketIo/chatController.js
// const Message = require('../models/Message');  // 你可以根据需要导入自己的 Mongoose 模型

// 处理聊天消息
exports.handleChatMessage = async (io, socket, msg) => {
  try {
    // 你可以将消息存储到 MongoDB（或其他数据库）
    // const newMessage = new Message({
    //   sender: 'User1',  // 这里是一个示例，你可以用实际用户名
    //   content: msg,
    // });

    // // 保存消息到数据库
    // await newMessage.save();

    // // 将消息广播给所有连接的客户端
    // io.emit('chat message', msg);
    console.log(msg);
    
  } catch (err) {
    console.error('Error handling chat message:', err);
  }
};
