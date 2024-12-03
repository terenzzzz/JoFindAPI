// socketIo/index.js
const socketIo = require('socket.io');


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

    /**
     * 创建或加入房间
     * 房间名是根据两个用户的 userId 动态生成的
     */
    socket.on('create or join', function (room) {
      try {
        const users = room.split("-")
        socket.join(room);
        io.sockets.to(room).emit('joined', room, users[0], users[1]);
        console.log(`created room ${room}`);
      } catch (e) {
        console.error("Error in 'create or join': ", e);
        socket.emit('error', { message: 'An error occurred while joining the room.' });
      }
    });

    /**
     * 发送聊天消息
     */
    socket.on('chat', function (room, userId, chatText) {
      try {
        if (!room || !userId || !chatText) {
          console.error("Invalid chat data:", { room, userId, chatText });
          return;
        }
        io.sockets.to(room).emit('chat', room, userId, chatText);
        console.log(`${userId} sent message to room ${room}: ${chatText}`);
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
