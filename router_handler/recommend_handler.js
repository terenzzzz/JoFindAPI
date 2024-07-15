
const axios = require('axios');
const mongodb = require("../model/mongodb")
const {getReduceDimension} = require("../utils/lyric/dimReductor") 
const {getSimilarWords} = require("../utils/lyric/word2vec") 
require('dotenv').config()
const recommend_api_url = process.env.MODEL_API 


exports.getTfidfRecommend = async (req, res) => {
    try{
        // Extract the lyric parameter from the request
        const { lyric } = req.query;

        // Send GET request to the target server
        const response = await axios.get(`${recommend_api_url}/getTfidfRecommend`, {
            params: { lyric: lyric }
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

        // Send the updated response back to the client
        return res.send({ status: 200, message: 'Success', data: updatedResponse });
 
    }catch(e){
        return res.send({ status: 1, message: e.message })
    }
};



exports.getTfidfSimilarity = async (req, res) => {
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

exports.getW2VSimilarity = async (req, res) => {
    try{
        const topSimilarities = await mongodb.getW2VSimilarity(req.query.track)
        // const topSimilaritiesWithoutValue = topSimilarities.topsimilar.map(similarity => 
        // similarity.track);

        return res.send({ status: 200, message: 'Success', data: topSimilarities})
    }catch(e){
        return res.send({ status: 1, message: e.message })
    }
};

exports.getLdaSimilarity = async (req, res) => {
    try{
        const topSimilarities = await mongodb.getLdaSimilarity(req.query.track)
        // const topSimilaritiesWithoutValue = topSimilarities.topsimilar.map(similarity => 
        // similarity.track);

        return res.send({ status: 200, message: 'Success', data: topSimilarities})
    }catch(e){
        return res.send({ status: 1, message: e.message })
    }
};

exports.getWeightedSimilarity = async (req, res) => {
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



