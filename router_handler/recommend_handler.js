
const axios = require('axios');
const mongodb = require("../model/mongodb");
const { addAbortListener } = require('connect-mongo');
require('dotenv').config()
const recommend_api_url = process.env.MODEL_API


exports.getTfidfRecommendArtistsByLyrics = async (req, res) => {
    try {
        const { lyrics } = req.body; // 从请求体中获取数组
  
        // 将数组通过POST请求发送给Flask服务器
        const response = await axios.post(`${recommend_api_url}/getTfidfRecommendArtistsByLyrics`, {
            lyrics: lyrics
        });

        const artistIds = response.data.map(item => item.artist.$oid);

        // Fetch track details from MongoDB
        const artistPromises = artistIds.map(id => mongodb.getArtist(id));
        const artistDetails = await Promise.all(artistPromises);

        // Replace track IDs with track details
        const updatedResponse = response.data.map((item, index) => ({
            similarity: item.similarity,
            artist: artistDetails[index]
        }));

        //Send the updated response back to the client
        return res.send({ status: 200, message: 'Success', data: updatedResponse });

    } catch (e) {
        console.error('Error:', e); // Print detailed error information
        return res.send({ status: 1, message: e.message });
    }
};

exports.getW2VRecommendArtistsByLyrics = async (req, res) => {
    try {
        const { lyrics } = req.body; // 从请求体中获取数组
  
        // 将数组通过POST请求发送给Flask服务器
        const response = await axios.post(`${recommend_api_url}/getW2VRecommendArtistsByLyrics`, {
            lyrics: lyrics
        });

        const artistIds = response.data.map(item => item.artist.$oid);

        // Fetch track details from MongoDB
        const artistPromises = artistIds.map(id => mongodb.getArtist(id));
        const artistDetails = await Promise.all(artistPromises);

        // Replace track IDs with track details
        const updatedResponse = response.data.map((item, index) => ({
            similarity: item.similarity,
            artist: artistDetails[index]
        }));

        //Send the updated response back to the client
        return res.send({ status: 200, message: 'Success', data: updatedResponse });

    } catch (e) {
        console.error('Error:', e); // Print detailed error information
        return res.send({ status: 1, message: e.message });
    }
};

exports.getLDARecommendArtistsByLyrics = async (req, res) => {
    try {
        const { lyrics } = req.body; // 从请求体中获取数组
  
        // 将数组通过POST请求发送给Flask服务器
        const response = await axios.post(`${recommend_api_url}/getLDARecommendArtistsByLyrics`, {
            lyrics: lyrics
        });

        const artistIds = response.data.map(item => item.artist.$oid);

        // Fetch track details from MongoDB
        const artistPromises = artistIds.map(id => mongodb.getArtist(id));
        const artistDetails = await Promise.all(artistPromises);

        // Replace track IDs with track details
        const updatedResponse = response.data.map((item, index) => ({
            similarity: item.similarity,
            artist: artistDetails[index]
        }));

        //Send the updated response back to the client
        return res.send({ status: 200, message: 'Success', data: updatedResponse });

    } catch (e) {
        console.error('Error:', e); // Print detailed error information
        return res.send({ status: 1, message: e.message });
    }
};

exports.getWeightedRecommendArtistsByLyrics = async (req, res) => {
    try {
        const { lyrics, tfidf_weight, w2v_weight, lda_weight } = req.body; // 从请求体中获取数组
  
        // 将数组通过POST请求发送给Flask服务器
        const response = await axios.post(`${recommend_api_url}/getWeightedRecommendArtistsByLyrics`, {
            lyrics, tfidf_weight, w2v_weight, lda_weight
        });

        const artistIds = response.data.map(item => item.artist.$oid);

        // Fetch track details from MongoDB
        const artistPromises = artistIds.map(id => mongodb.getArtist(id));
        const artistDetails = await Promise.all(artistPromises);

        // Replace track IDs with track details
        const updatedResponse = response.data.map((item, index) => ({
            similarity: item.similarity,
            artist: artistDetails[index]
        }));

        //Send the updated response back to the client
        return res.send({ status: 200, message: 'Success', data: updatedResponse });

    } catch (e) {
        console.error('Error:', e); // Print detailed error information
        return res.send({ status: 1, message: e.message });
    }
};



exports.getTfidfRecommendArtistsByArtist = async (req, res) => {
    try {
        const { artist } = req.body; // 从请求体中获取数组
  
        // 将数组通过POST请求发送给Flask服务器
        const response = await axios.post(`${recommend_api_url}/getTfidfRecommendArtistsByArtist`, {
            artist: artist
        });

        const artistIds = response.data.map(item => item.artist.$oid);

        // Fetch track details from MongoDB
        const artistPromises = artistIds.map(id => mongodb.getArtist(id));
        const artistDetails = await Promise.all(artistPromises);

        // Replace track IDs with track details
        const updatedResponse = response.data.map((item, index) => ({
            similarity: item.similarity,
            artist: artistDetails[index]
        }));

        //Send the updated response back to the client
        return res.send({ status: 200, message: 'Success', data: updatedResponse });

    } catch (e) {
        console.error('Error:', e); // Print detailed error information
        return res.send({ status: 1, message: e.message });
    }
};

exports.getW2VRecommendArtistsByArtist = async (req, res) => {
    try {
        const { artist } = req.body; // 从请求体中获取数组
  
        // 将数组通过POST请求发送给Flask服务器
        const response = await axios.post(`${recommend_api_url}/getW2VRecommendArtistsByArtist`, {
            artist: artist
        });

        const artistIds = response.data.map(item => item.artist.$oid);

        // Fetch track details from MongoDB
        const artistPromises = artistIds.map(id => mongodb.getArtist(id));
        const artistDetails = await Promise.all(artistPromises);

        // Replace track IDs with track details
        const updatedResponse = response.data.map((item, index) => ({
            similarity: item.similarity,
            artist: artistDetails[index]
        }));

        //Send the updated response back to the client
        return res.send({ status: 200, message: 'Success', data: updatedResponse });

    } catch (e) {
        console.error('Error:', e); // Print detailed error information
        return res.send({ status: 1, message: e.message });
    }
};

exports.getLDARecommendArtistsByArtist = async (req, res) => {
    try {
        const { artist } = req.body; // 从请求体中获取数组
  
        // 将数组通过POST请求发送给Flask服务器
        const response = await axios.post(`${recommend_api_url}/getLDARecommendArtistsByArtist`, {
            artist: artist
        });

        const artistIds = response.data.map(item => item.artist.$oid);

        // Fetch track details from MongoDB
        const artistPromises = artistIds.map(id => mongodb.getArtist(id));
        const artistDetails = await Promise.all(artistPromises);

        // Replace track IDs with track details
        const updatedResponse = response.data.map((item, index) => ({
            similarity: item.similarity,
            artist: artistDetails[index]
        }));

        //Send the updated response back to the client
        return res.send({ status: 200, message: 'Success', data: updatedResponse });

    } catch (e) {
        console.error('Error:', e); // Print detailed error information
        return res.send({ status: 1, message: e.message });
    }
};

exports.getWeightedRecommendArtistsByArtist = async (req, res) => {
    try {
        const { artist, tfidf_weight, w2v_weight, lda_weight } = req.body; // 从请求体中获取数组
  
        // 将数组通过POST请求发送给Flask服务器
        const response = await axios.post(`${recommend_api_url}/getWeightedRecommendArtistsByArtist`, 
            { artist, tfidf_weight, w2v_weight, lda_weight });

        const artistIds = response.data.map(item => item.artist.$oid);

        // Fetch track details from MongoDB
        const artistPromises = artistIds.map(id => mongodb.getArtist(id));
        const artistDetails = await Promise.all(artistPromises);

        // Replace track IDs with track details
        const updatedResponse = response.data.map((item, index) => ({
            similarity: item.similarity,
            artist: artistDetails[index]
        }));

        //Send the updated response back to the client
        return res.send({ status: 200, message: 'Success', data: updatedResponse });

    } catch (e) {
        console.error('Error:', e); // Print detailed error information
        return res.send({ status: 1, message: e.message });
    }
};


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
        const { lyric, tfidf_weight, w2v_weight, lda_weight } = req.body; // 从请求体中获取数组
  
        // 将数组通过POST请求发送给Flask服务器
        const response = await axios.post(`${recommend_api_url}/getWeightedRecommendByLyrics`, 
            { lyric, tfidf_weight, w2v_weight, lda_weight});

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
        console.error('Error:', e);
        
        let errorMessage = 'An unknown error occurred';
        
        // 检查是否存在响应数据
        if (e.response && e.response.data) {
            // 如果响应数据中有 error 字段，使用它作为错误信息
            if (e.response.data.error) {
                errorMessage = e.response.data.error;
            } else {
                // 如果没有 error 字段，但有其他数据，将整个数据转为字符串
                errorMessage = JSON.stringify(e.response.data);
            }
        } else if (e.message) {
            // 如果没有响应数据，但有错误消息，使用错误消息
            errorMessage = e.message;
        }
        
        return res.status(400).json({ status: 1, message: errorMessage });
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



