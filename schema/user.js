// 用户信息验证规则模块
// 导入定义验证规则模块
const joi = require('joi')

/*** string() 值必须是字符串 
 * * alphanum() 值只能是包含 a-zA-Z0-9 的字符串 
 * * min(length) 最小长度 * max(length) 最大长度 
 * * required() 值是必填项，不能为 undefined 
 * * pattern(正则表达式) 值必须符合正则表达式的规则 
 * */

const name =  joi.string()
// 邮箱号验证规则
const email = joi.string().pattern(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)
// 密码验证规则
// 8-16个字符，至少1个大写字母，1个小写字母和1个数字
const password = joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,16}$/)
// 8-16个字符，至少1个大写字母，1个小写字母和1个数字
const confirmPassword = joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,16}$/)

// 8-16个字符，至少1个大写字母，1个小写字母和1个数字
const newPassword = joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,16}$/)


// 注册和登录表单的验证规则对象 
exports.user_schema = {
    // 表示需要对 req.body 中的数据进行验证
    body: { name, email, password, confirmPassword,newPassword },
}