
const axios = require('axios');
const mongodb = require("../model/mongodb")
const {getReduceDimension} = require("../utils/lyric/dimReductor") 



exports.get2dModel = async (req, res) => {
    try {
        const reducedData = await getReduceDimension();
        return res.send({ status: 200, message: 'Success', data: reducedData });
    } catch (err) {
        return res.send({ status: 1, message: err.message });
    }
};


