const sqlite3 = require('sqlite3');
const db = require('../db/index')
const logger = require('../utils/logger');
const axios = require('axios');
const mongodb = require("../model/mongodb")

// 获取Tracks
exports.getTracks = async (req, res) => {
  try{
    const tracks = await mongodb.getTracks()
    return res.send({ status: 200, message: 'Success', data: tracks})
  }catch(e){
    return res.send({ status: 1, message: err.message })
  }
};

exports.getDailyRecomm = async (req, res) => {
  // TODO: Update Recomm Algorithm
  try{
    const tracks = await mongodb.getRandomTracks()
    return res.send({ status: 200, message: 'Success', data: tracks})
  }catch(e){
    return res.send({ status: 1, message: err.message })
  }
}

exports.getResonanace = async (req, res) => {
  // TODO: Update Algorithm
  try{
    const tracks = await mongodb.getRandomTracks()
    return res.send({ status: 200, message: 'Success', data: tracks})
  }catch(e){
    return res.send({ status: 1, message: err.message })
  }
}

exports.getMoodVibe = async (req, res) => {
  // TODO: Update Algorithm
  try{
    const tracks = await mongodb.getRandomTracks()
    return res.send({ status: 200, message: 'Success', data: tracks})
  }catch(e){
    return res.send({ status: 1, message: err.message })
  }
}

exports.getSceneRhythm = async (req, res) => {
  // TODO: Update Algorithm
  try{
    const tracks = await mongodb.getRandomTracks()
    return res.send({ status: 200, message: 'Success', data: tracks})
  }catch(e){
    return res.send({ status: 1, message: err.message })
  }
}

exports.getRecentlyPlayed = async (req, res) => {
  // TODO: Update Algorithm
  try{
    const tracks = await mongodb.getRandomTracks()
    return res.send({ status: 200, message: 'Success', data: tracks})
  }catch(e){
    return res.send({ status: 1, message: err.message })
  }
}

