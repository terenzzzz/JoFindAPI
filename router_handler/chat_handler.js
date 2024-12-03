const axios = require('axios');
const mongodb = require("../model/mongodb");



exports.createRoom = async (req, res) => {
    try{
        const addedChatRoom = await mongodb.createRoom(req.user._id, req.body.company)
        if (addedChatRoom){
            return res.send({ status: 200, message: 'Success', data: addedChatRoom})
        }else{
            return res.send({ status: 1, message: 'Added Chat room Failed' })
        }
        
    }catch(err){
        return res.send({ status: 1, message: err.message })
    }
};


exports.getChatRoomBySeeker = async (req, res) => {
    try{
        const chatRooms = await mongodb.getChatRoomBySeeker(req.user._id)
        return res.send({ status: 200, message: 'Success', data: chatRooms})
        
    }catch(err){
        return res.send({ status: 1, message: err.message })
    }
};

exports.getChatRoomByCompany = async (req, res) => {
    try{
        const chatRooms = await mongodb.getChatRoomByCompany(req.user.company)
        return res.send({ status: 200, message: 'Success', data: chatRooms})
        
    }catch(err){
        return res.send({ status: 1, message: err.message })
    }
};



exports.createMsg = async (req, res) => {
    try{
        const addedMsg = await mongodb.createMsg(req.body.chatroom, req.user._id, req.body.msg)
        if (addedMsg){
            return res.send({ status: 200, message: 'Success', data: addedMsg})
        }else{
            return res.send({ status: 1, message: 'Added Message Failed' })
        }
        
    }catch(err){
        return res.send({ status: 1, message: err.message })
    }
};

exports.getMsgByChatRoom = async (req, res) => {
    try{
        const msg = await mongodb.getMsgByChatRoom(req.query.chatRoom)
        return res.send({ status: 200, message: 'Success', data: msg})
        
    }catch(err){
        return res.send({ status: 1, message: err.message })
    }
};