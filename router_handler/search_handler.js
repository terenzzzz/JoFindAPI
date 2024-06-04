const logger = require('../utils/logger');
const axios = require('axios');
const mongodb = require("../model/mongodb");



exports.search = async (req, res) => {
  try {
    const keyword = req.query.keyword;
    const types = req.query.type instanceof Array ? req.query.type : [req.query.type];
    const limit = req.query.limit


    // 检查是否至少有一个类型被提供
    if (types.length === 0) {
      return res.send({ status: 400, message: 'Missing type parameter' });
    }

    const result = await mongodb.search(keyword, types, limit);

    return res.send({ status: 200, message: 'Success', data: result });
  } catch (err) {
    return res.send({ status: 1, message: err.message });
  }
};




