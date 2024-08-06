const { mongo } = require("mongoose");
const { itemTypes } = require("../model/enum/itemTypes");
const mongodb = require("../model/mongodb")
const recommend_api_url = process.env.MODEL_API
const axios = require('axios');

exports.addRating = async (req, res) => {
    try{
        let item = {
            item: req.body.item,  // 或 artistId
            itemType: req.body.itemType,  // enum: ['Track', 'Artist']
            rate: parseInt(req.body.rate),
            user: req.user._id
          }
        const newRating = await mongodb.addRating(item)
        if (newRating._id){
            return res.send({ status: 200, message: 'Success', data: newRating})
        }
        return res.send({ status: 1, message: newRating.message})
    }catch(err){
        return res.send({ status: 1, message: err.message })
    }
};

exports.deleteRating = async (req, res) => {
  try {
      const { item, itemType } = req.body; // 从请求体中获取user和item
      const user = req.user._id
      if (!user || !item) {
          return res.status(400).send({ status: 1, message: 'User and item are required.' });
      }

      const deletedRating = await mongodb.deleteRating(user, item, itemType);

      if (deletedRating) {
          return res.status(200).send({ status: 200, message: 'Success', data: deletedRating });
      } else {
          return res.status(404).send({ status: 1, message: 'Rating not found.' });
      }
  } catch (err) {
      return res.status(500).send({ status: 1, message: err.message });
  }
};


exports.getRating = async (req, res) => {
  try {
    // 获取用户的历史记录
    const rating = await mongodb.getRating(req.user._id, req.query.item, req.query.itemType);
    // 检查是否有历史记录
    console.log(rating);
    if (rating._id) {
      return res.send({ status: 200, message: 'Success', data: rating });
    } else {
      return res.send({ status: 1, message: 'Can not found the rating record' });
    }
  } catch (err) {
    // 如果出现错误，返回错误信息
    return res.send({ status: 1, message: err.message });
  }
};

exports.getRatings = async (req, res) => {
  try{
    const ratings = await mongodb.getRatings(req.user._id)

    let ratedTracks=[]
    let ratedArtists=[]


    ratings.forEach(item => {
      if (item.itemType === itemTypes.TRACK) {
        ratedTracks.push(item);
      } else if (item.itemType === itemTypes.ARTIST) {
        ratedArtists.push(item);
      }
    });

    const responseBody = { ratedTracks,ratedArtists };

    // 关键词分析
    const isStatWords = req.query.isStatWords === "true";
    if (isStatWords) {
      const keywordStatArray = await keywordStat(ratedTracks);
      responseBody.keywordStatArray = keywordStatArray.slice(0,50);
    }


    // 听歌主题分析
    const isStatTopic = req.query.isStatTopic === "true"; 
    if (isStatTopic) {
      const topicArray = await topicStat(ratedTracks);
      responseBody.topicArray = topicArray;
    }
  
    return res.status(200).send(responseBody);
  }catch(err){
    return res.send({ status: 1, message: err.message })
  }
};

const topicStat = async (ratedList) => {
  let lyrics = []
  for (const ratedTrack of ratedList) {
    if (ratedTrack.rate >= 3) {
      const lyric = ratedTrack.item.lyric;
      lyrics.push(lyric)
    }
  }
  try {
    const response = await axios.post(`${recommend_api_url}/getTrackTopicByLyric`, {
      lyric: lyrics
    });
    
    let topics = response.data;

    // 遍历response并获取代表词
    const enrichedData = await Promise.all(
      topics.map(async (topic) => {
        const { topic_id } = topic;
        
        // 查询数据库获取代表词
        const topicDetail = await mongodb.getTopicByTopicId(topic_id);
        
        // 返回包含原始数据和代表词的新对象
        return {
          ...topic,
          name: topicDetail.name // 假设代表词字段是'represent_word'
        };
      })
    );

    let label = enrichedData.map(topic => topic.name)
    let data = enrichedData.map(topic => topic.probability)

    return {label,data}

  } catch (error) {
    console.error(error);
  }

}

const keywordStat = async (ratedList) => {
  let keywordStatArray = [];
  for (const ratedTrack of ratedList) {
    if (ratedTrack.rate >= 3) {
      const trackId = ratedTrack.item._id;
      const lyric = ratedTrack.item.lyric;

      try {
        const response = await axios.post(`${recommend_api_url}/getLyricTopWordsByLyric`, {
          lyric: lyric
        });
        
        const keywords = response.data;
        keywordStatArray = keywordStatArray.concat(keywords) // Add keyword to keywordStatArray

      } catch (error) {
        console.error(`Error fetching keywords for track ID ${trackId}:`, error);
      }
    }
  }

  // Aggregate word frequencies
  const aggregatedData = countWordOccurrences(keywordStatArray);
  
  return aggregatedData;

}

const countWordOccurrences = (keywordStatArray) => {
  const wordCount = new Map();

  keywordStatArray.forEach(({ word }) => {
    if (wordCount.has(word)) {
      wordCount.set(word, wordCount.get(word) + 1);
    } else {
      wordCount.set(word, 1);
    }
  });

  // Convert the Map to an array of objects
  const wordCountArray = Array.from(wordCount, ([text, count]) => ({
    word: text,
    value: count
  }));

  // Sort the array in descending order based on the count (value)
  wordCountArray.sort((a, b) => b.value - a.value);

  return wordCountArray;
};