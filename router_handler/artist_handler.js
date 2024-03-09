const sqlite3 = require('sqlite3');
const db = require('../db/index')
const logger = require('../utils/logger');
const axios = require('axios');


// 获取Tracks
exports.gerRecommArtist = (req, res) => {
  const limit = req.query.limit || 10;
  const sqlQuery = `select * from Artists LIMIT ${30}`;
  db.query(sqlQuery, function (err, results) {
    if (err) {
        return res.send({ status: 1, message: err.message })
    }

    return res.send({ status: 200, message: 'Success', data: results})

  })
};




