// 导入 express 模块
var express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const http = require('http');  // 导入 http 模块

// 创建 express 的服务器实例
var app = express();

// 导入 cors 中间件
const cors = require('cors')
// 将 cors 注册为全局中间件
app.use(cors());
app.use(cookieParser());
// 配置解析 application/x-www-form-urlencoded 格式的表单数据的中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '')));

// 响应数据的中间件
app.use(function (req, res, next) {
    res.cc = function (err, status = -1) {
        res.send({
            status,
            message: err instanceof Error ? err.message : err,
        });
    }
    next();
});

// 导入配置文件
const config = require('./config');
// 解析 token 的中间件
const expressJWT = require('express-jwt');
const mongo = require('./model/mongodb');

// 使用 .unless({ path: [/^\/api\//] }) 指定哪些接口不需要进行 Token 的身份认证
app.use(expressJWT({ secret: config.jwtSecretKey, algorithms: ['HS256'] }).unless({ path: [/^\/api\//] }));
app.use('/public/upload', express.static('public/upload'));

// 路由模块
const authRouter = require('./router/auth');
const userRouter = require('./router/user');
const seekingStatusRouter = require('./router/seekingStatus');
const companyRouter = require('./router/company');
const jobRouter = require('./router/job');
const applicationRouter = require('./router/application');
const resumeRouter = require('./router/resume');

app.use('/api', authRouter);
app.use('/app', userRouter);
app.use('/app', seekingStatusRouter);
app.use('/app', companyRouter);
app.use('/app', jobRouter);
app.use('/app', applicationRouter);
app.use('/app', resumeRouter);

// 错误级别中间件
app.use((err, req, res, next) => {
    if (err.name === 'ValidationError') return res.cc(err);
    if (err.name === 'UnauthorizedError') {
        return res.send({
            status: 401,
            message: '无效的token',
        });
    }
    console.log(err);
});

// 创建 HTTP 服务器
const server = http.createServer(app);

// 导入并应用 socket.io 配置
const socketIo = require('./socketIo'); // 导入 socket.io 配置文件
socketIo(server);  // 将 HTTP 服务器传递给 socket.io 配置

// 部署使用
const host = 'localhost';
const port = process.env.PORT || 6906;

server.listen(port, host, function () {
    console.log('api server running at http://' + host + ':' + port);
});
