// socketIo/index.js
const socketIo = require('socket.io');

module.exports = function (server) {
  const io = socketIo(server, {
    cors: {
      origin: "*",  // 允许的前端地址
      methods: ["GET", "POST"],         // 允许的请求方法
      allowedHeaders: ["Content-Type"], // 允许的请求头
      credentials: true                 // 允许发送凭据（cookies、Authorization）
    }
  });

  // 设置连接和断开连接事件
  io.on('connection', (socket) => {
    console.log('A user connected');

    // 监听来自客户端的消息
    socket.on('chat message', (msg) => {
      // 处理消息
      console.log(msg);
      // 发送消息
      socket.emit('chat message', msg);
    });

    // 监听客户端断开连接
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
};
