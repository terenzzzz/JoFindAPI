const db = require('../db/index')
const logger = require('../utils/logger');
const axios = require('axios');
const mongodb = require("../model/mongodb")

exports.getRandomTracks = async (req, res) => {
  try{
    const tracks = await mongodb.getRandomTracks()
    return res.send({ status: 200, message: 'Success', data: tracks})
  }catch(e){
    return res.send({ status: 1, message: e.message })
  }
}

// 获取Tracks
exports.getTracks = async (req, res) => {
  try{
    const tracks = await mongodb.getTracks()
    return res.send({ status: 200, message: 'Success', data: tracks})
  }catch(e){
    return res.send({ status: 1, message: e.message })
  }
};

exports.getTracksByArtist = async (req, res) => {
  try{
    const tracks = await mongodb.getTracksByArtist(req.query.artist)
    return res.send({ status: 200, message: 'Success', data: tracks})
  }catch(e){
    return res.send({ status: 1, message: e.message })
  }
};


exports.getTrackById = async (req, res) => {
  try{
    const track = await mongodb.getTrackById(req.query.track)
    return res.send({ status: 200, message: 'Success', data: track})
  }catch(e){
    return res.send({ status: 1, message: e.message })
  }
};

exports.getTracksByTag = async (req, res) => {
  try{
    const track = await mongodb.getTracksByTag(req.query.tag)
    return res.send({ status: 200, message: 'Success', data: track})
  }catch(e){
    return res.send({ status: 1, message: e.message })
  }
};

exports.getDailyRecomm = async (req, res) => {
  // TODO: Update Recomm Algorithm
  try{
    const tracks = await mongodb.getRandomTracks()
    return res.send({ status: 200, message: 'Success', data: tracks})
  }catch(e){
    return res.send({ status: 1, message: e.message })
  }
}

exports.getResonanace = async (req, res) => {
  // TODO: Update Algorithm
  try{
    const tracks = await mongodb.getRandomTracks()
    return res.send({ status: 200, message: 'Success', data: tracks})
  }catch(e){
    return res.send({ status: 1, message: e.message })
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
    return res.send({ status: 1, message: e.message })
  }
}

exports.getRecentlyPlayed = async (req, res) => {
  try{
    const histories = await mongodb.getHistories(req.user._id);
    const reversedHistories = histories.reverse(); // 将历史记录数组顺序颠倒
    
    const tracks = reversedHistories.map(history => history.track);
    return res.send({ status: 200, message: 'Success', data: tracks})
  }catch(e){
    return res.send({ status: 1, message: e.message })
  }
}

