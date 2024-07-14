
const axios = require('axios');
const mongodb = require("../model/mongodb")
const {getReduceDimension} = require("../utils/lyric/dimReductor") 
const {getSimilarWords} = require("../utils/lyric/word2vec") 

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



