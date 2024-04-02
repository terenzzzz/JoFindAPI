const axios = require('axios');
const mongodb = require("../model/mongodb");
const { log } = require('../utils/logger');


exports.addPlayList = async (req, res) => {
    try{
        let playList = {
            name: req.body.name,
            description: req.body.description,
            cover: req.file.path,
            user: req.user._id
        }
        const newPlayList = await mongodb.addPlayList(playList)
        return res.send({ status: 200, message: 'Success', data: newPlayList})
    }catch(err){
        return res.send({ status: 1, message: err.message })
    }
};

exports.getPlayLists = async (req, res) => {
    try{
        const playlists = await mongodb.getPlayLists(req.user._id)
        return res.send({ status: 200, message: 'Success', data: playlists})
    }catch(err){
        return res.send({ status: 1, message: err.message })
    }
};

exports.getPlayList = async (req, res) => {
    try{
        console.log(`GetPlayList: id= ${req.query.id}`);
        const playlist = await mongodb.getPlayList(req.query.id)
        return res.send({ status: 200, message: 'Success', data: playlist})
    }catch(err){
        return res.send({ status: 1, message: err.message })
    }
};