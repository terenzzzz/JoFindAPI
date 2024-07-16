
const axios = require('axios');
const mongodb = require("../model/mongodb")
const {getReduceDimension} = require("../utils/lyric/dimReductor") 
const {getSimilarWords} = require("../utils/lyric/word2vec") 
require('dotenv').config()
const recommend_api_url = process.env.MODEL_API 


exports.getTfidfRecommendByLyrics = async (req, res) => {
    try {
        const { lyric } = req.body; // 从请求体中获取数组
  
        // 将数组通过POST请求发送给Flask服务器
        const response = await axios.post(`${recommend_api_url}/getTfidfRecommendByLyrics`, {
            lyric: lyric
        });

        const trackIds = response.data.map(item => item.track.$oid);

        // Fetch track details from MongoDB
        const trackPromises = trackIds.map(id => mongodb.getTrackById(id));
        const trackDetails = await Promise.all(trackPromises);

        // Replace track IDs with track details
        const updatedResponse = response.data.map((item, index) => ({
            similarity: item.similarity,
            track: trackDetails[index]
        }));

        //Send the updated response back to the client
        return res.send({ status: 200, message: 'Success', data: updatedResponse });

    } catch (e) {
        console.error('Error:', e); // Print detailed error information
        return res.send({ status: 1, message: e.message });
    }
};

exports.getW2VRecommendByLyrics = async (req, res) => {
    try {
        const { lyric } = req.body; // 从请求体中获取数组
  
        // 将数组通过POST请求发送给Flask服务器
        const response = await axios.post(`${recommend_api_url}/getW2VRecommendByLyrics`, {
            lyric: lyric
        });

        const trackIds = response.data.map(item => item.track.$oid);

        // Fetch track details from MongoDB
        const trackPromises = trackIds.map(id => mongodb.getTrackById(id));
        const trackDetails = await Promise.all(trackPromises);

        // Replace track IDs with track details
        const updatedResponse = response.data.map((item, index) => ({
            similarity: item.similarity,
            track: trackDetails[index]
        }));

        //Send the updated response back to the client
        return res.send({ status: 200, message: 'Success', data: updatedResponse });

    } catch (e) {
        console.error('Error:', e); // Print detailed error information
        return res.send({ status: 1, message: e.message });
    }
};

exports.getLDARecommendByLyrics = async (req, res) => {
    try {
        const { lyric } = req.body; // 从请求体中获取数组
  
        // 将数组通过POST请求发送给Flask服务器
        const response = await axios.post(`${recommend_api_url}/getLDARecommendByLyrics`, {
            lyric: lyric
        });

        const trackIds = response.data.map(item => item.track.$oid);

        // Fetch track details from MongoDB
        const trackPromises = trackIds.map(id => mongodb.getTrackById(id));
        const trackDetails = await Promise.all(trackPromises);

        // Replace track IDs with track details
        const updatedResponse = response.data.map((item, index) => ({
            similarity: item.similarity,
            track: trackDetails[index]
        }));

        //Send the updated response back to the client
        return res.send({ status: 200, message: 'Success', data: updatedResponse });

    } catch (e) {
        console.error('Error:', e); // Print detailed error information
        return res.send({ status: 1, message: e.message });
    }
};

exports.getWeightedRecommendByLyrics = async (req, res) => {
    try {
        const { lyric } = req.body; // 从请求体中获取数组
  
        // 将数组通过POST请求发送给Flask服务器
        const response = await axios.post(`${recommend_api_url}/getWeightedRecommendByLyrics`, {
            lyric: lyric
        });

        const trackIds = response.data.map(item => item.track.$oid);

        // Fetch track details from MongoDB
        const trackPromises = trackIds.map(id => mongodb.getTrackById(id));
        const trackDetails = await Promise.all(trackPromises);

        // Replace track IDs with track details
        const updatedResponse = response.data.map((item, index) => ({
            similarity: item.similarity,
            track: trackDetails[index]
        }));

        //Send the updated response back to the client
        return res.send({ status: 200, message: 'Success', data: updatedResponse });

    } catch (e) {
        console.error('Error:', e); // Print detailed error information
        return res.send({ status: 1, message: e.message });
    }
};




exports.getTfidfRecommendByTrack = async (req, res) => {
    try{
        const topSimilarities = await mongodb.getTfidfSimilarity(req.query.track)
        // console.log(topSimilarities);
        // const topSimilaritiesWithoutValue = topSimilarities.topsimilar.map(similarity => 
        // similarity.track);

        return res.send({ status: 200, message: 'Success', data: topSimilarities})
    }catch(e){
        return res.send({ status: 1, message: e.message })
    }
};

exports.getW2VRecommendByTrack = async (req, res) => {
    try{
        const topSimilarities = await mongodb.getW2VSimilarity(req.query.track)
        // const topSimilaritiesWithoutValue = topSimilarities.topsimilar.map(similarity => 
        // similarity.track);

        return res.send({ status: 200, message: 'Success', data: topSimilarities})
    }catch(e){
        return res.send({ status: 1, message: e.message })
    }
};

exports.getLdaRecommendByTrack = async (req, res) => {
    try{
        const topSimilarities = await mongodb.getLdaSimilarity(req.query.track)
        // const topSimilaritiesWithoutValue = topSimilarities.topsimilar.map(similarity => 
        // similarity.track);

        return res.send({ status: 200, message: 'Success', data: topSimilarities})
    }catch(e){
        return res.send({ status: 1, message: e.message })
    }
};

exports.getWeightedRecommendByTrack = async (req, res) => {
    try{
        const topSimilarities = await mongodb.getWeightedSimilarity(req.query.track)
        // const topSimilaritiesWithoutValue = topSimilarities.topsimilar.map(similarity => 
        // similarity.track);

        return res.send({ status: 200, message: 'Success', data: topSimilarities})
    }catch(e){
        return res.send({ status: 1, message: e.message })
    }
};



exports.get2dModel = async (req, res) => {
    try {
        const reducedData = await getReduceDimension();
        return res.send({ status: 200, message: 'Success', data: reducedData });
    } catch (err) {
        return res.send({ status: 1, message: err.message });
    }
};

exports.getSimilarWords = async (req, res) => {
    try {
        const similarWords = await getSimilarWords("model_2024-06-24", 
        "wordIndex_2024-06-24.json", req.query.word);
        return res.send({ status: 200, message: 'Success', data: similarWords });
    } catch (err) {
        return res.send({ status: 1, message: err.message });
    }
};



