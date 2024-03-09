const sqlite3 = require('sqlite3');
const db = require('../db/index')
const logger = require('../utils/logger');
const axios = require('axios');


// 获取Tracks
exports.getTracks = (req, res) => {
  const limit = req.query.limit || 10;
  const sqlQuery = `select * from Tracks LIMIT ${limit}`;
  db.query(sqlQuery, function (err, results) {
    if (err) {
        return res.send({ status: 1, message: err.message })
    }

    return res.send({ status: 200, message: 'Success', data: results})

  })
};

exports.getDailyRecomm = (req, res) => {
  // TODO: Update Recomm Algorithm
  const sqlQuery = `SELECT * FROM Tracks ORDER BY RAND() LIMIT 20`;
  db.query(sqlQuery, function (err, results) {
    if (err) {
        return res.send({ status: 1, message: err.message })
    }

    return res.send({ status: 200, message: 'Success', data: results})

  })
}

exports.getResonanace = (req, res) => {
  // TODO: Update Algorithm
  const sqlQuery = `SELECT * FROM Tracks ORDER BY RAND() LIMIT 20`;
  db.query(sqlQuery, function (err, results) {
    if (err) {
        return res.send({ status: 1, message: err.message })
    }

    return res.send({ status: 200, message: 'Success', data: results})

  })
}

exports.getMoodVibe = (req, res) => {
  // TODO: Update Algorithm
  const sqlQuery = `SELECT * FROM Tracks ORDER BY RAND() LIMIT 20`;
  db.query(sqlQuery, function (err, results) {
    if (err) {
        return res.send({ status: 1, message: err.message })
    }

    return res.send({ status: 200, message: 'Success', data: results})

  })
}

exports.getSceneRhythm = (req, res) => {
  // TODO: Update Algorithm
  const sqlQuery = `SELECT * FROM Tracks ORDER BY RAND() LIMIT 20`;
  db.query(sqlQuery, function (err, results) {
    if (err) {
        return res.send({ status: 1, message: err.message })
    }

    return res.send({ status: 200, message: 'Success', data: results})

  })
}

exports.getRecentlyPlayed = (req, res) => {
  // TODO: Update Algorithm
  const sqlQuery = `SELECT * FROM Tracks ORDER BY RAND() LIMIT 20`;
  db.query(sqlQuery, function (err, results) {
    if (err) {
        return res.send({ status: 1, message: err.message })
    }

    return res.send({ status: 200, message: 'Success', data: results})

  })
}

