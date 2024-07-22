const axios = require('axios');
const mongodb = require("../model/mongodb");
const { log } = require('../utils/logger');
const tag = require('../model/schema/tag');


exports.getUser = async (req, res) => {
    try{
        let user_id = req.user._id
        const user = await mongodb.getUser(user_id)
        return res.send({ status: 200, message: 'Success', data: user})
    }catch(err){
        return res.send({ status: 1, message: err.message })
    }
};

exports.updateSpotifyRefreshToken = async (req, res) => {
    try{
        let user_id = req.user._id
        let token = req.body.refreshToken
        console.log("token: " + token);
        const user = await mongodb.updateSpotifyRefreshToken(user_id,token)
        return res.send({ status: 200, message: 'Success'})
    }catch(err){
        return res.send({ status: 1, message: err.message })
    }
};

exports.updateTags = async (req, res) => {
    try{
        let ratingAbove3 = []
        let tagsAbove3 = []
        const ratings = await mongodb.getRatings(req.user._id)
        ratings.map(rating => {
            if(rating.rate>3){
                ratingAbove3.push(rating)
                rating.item.tags.forEach(tag => tagsAbove3.push(tag.tag))
            }
        })

        // 统计每个 tag 出现的次数
        const tagCounts = tagsAbove3.reduce((acc, tag) => {
            const tagStr = tag.toString();
            acc[tagStr] = (acc[tagStr] || 0) + 1;
            return acc;
        }, {});

        // 将结果转换为符合 schema 的数组，并按次数排序
        const sortedTagCounts = Object.entries(tagCounts)
            .map(([tag, count]) => ({
                tag: tag,
                count: count
            }))
            .sort((a, b) => b.count - a.count);


        const user = await mongodb.updateUserTags(req.user._id,sortedTagCounts)

    
        return res.send({ status: 200, message: 'Success', data: user.tags})
    }catch(err){
      return res.send({ status: 1, message: err.message })
    }
  };

  