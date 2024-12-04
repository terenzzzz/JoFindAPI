// socketIo/index.js
const socketIo = require('socket.io');
const mongodb = require("../model/mongodb");


module.exports = function (server) {
  const io = socketIo(server, {
    cors: {
    //   origin: "*",  // '*' 允许所有域
      origin: 'http://localhost:5173', // 允许的前端地址
      methods: ["GET", "POST"],         // 允许的请求方法
      allowedHeaders: ["Content-Type"], // 允许的请求头
      credentials: true,                 // 允许发送凭据（cookies、Authorization）
    }
  });

  // 设置连接和断开连接事件
  io.sockets.on('connection', function (socket) {
     console.log(`New client connected: ${socket.id}`);

    socket.on('create or join', function (room) {
      try {
        socket.join(room);
        io.sockets.to(room).emit('joined', room);
      } catch (e) {
        console.error("Error in 'create or join': ", e);
        socket.emit('error', { message: 'An error occurred while joining the room.' });
      }
    });

    /**
     * 发送聊天消息
     */
    socket.on('send msg', async function (room, sender, chatText) {
      try {
        // 检查消息合法性
        if (!room || !sender || !chatText) {
          console.error("Invalid chat data:", { room, sender, chatText });
          return;
        }

        // 处理发送的消息
        io.sockets.to(room).emit('msg send', room, sender, chatText);
        console.log(`${sender} sent message to room ${room}: ${chatText}`);

        // 储存信息到mongodb
        await mongodb.createMsg(room, sender, chatText)

      } catch (e) {
        console.error("Error in 'chat': ", e);
        socket.emit('error', { message: 'An error occurred while sending the message.' });
      }
    });

    /**
     * 用户断开连接时清理房间
     */
    socket.on('disconnect', function() {
        console.log(`Client disconnected: ${socket.id}`);
        // 通知房间内其他用户该用户已经断开连接
        io.sockets.emit('user-disconnected', socket.id);
    });
  });
};
