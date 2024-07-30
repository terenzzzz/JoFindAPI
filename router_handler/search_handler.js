const logger = require('../utils/logger');
const axios = require('axios');
const mongodb = require("../model/mongodb");



exports.search = async (req, res) => {
  try {
    const { keyword, type, limit = 20 } = req.query;

    const result = await mongodb.search(keyword, type, limit);

    return res.send({ status: 200, message: 'Success', data: result });
  } catch (err) {
    return res.send({ status: 1, message: err.message });
  }
};




