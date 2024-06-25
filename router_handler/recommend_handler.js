
const axios = require('axios');
const mongodb = require("../model/mongodb")
const {getReduceDimension} = require("../utils/lyric/dimReductor") 
const {getSimilarWords} = require("../utils/lyric/word2vec") 



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



