const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')
require('dotenv').config()


/* Schemas */
const {Artist} = require("./schema/artist");
const {Tag} = require("./schema/tag");
const {Track} = require("./schema/track");
const {User} = require("./schema/user");
const {PlayList} = require("./schema/playList");
const {PlayListTrack} = require("./schema/playListTrack");
const {History} = require("./schema/history");
const {Rating} = require("./schema/rating");


/* Variables */
let connected = false;
mongoose.connect(process.env.MONGO_CONNECTION);

const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', async () => {
    console.log(`Connected to ${process.env.MONGO_CONNECTION}`);
    connected = true;
});

/* Search Function */
const search = async (keyword, types, limit) => {
    try {
      let tracks = [];
      let artists = [];
      let lyrics = [];

  
      // 创建正则表达式对象，用于模糊匹配
      const regex = new RegExp(keyword, 'i');
  
      // 根据types数组执行相应的搜索操作
      if (types.includes('tracks')) {
        tracks = await Track.find({ name: regex })
          .populate({
            path: 'artist',
          })
          .limit(limit);
      }
  
      if (types.includes('artists')) {
        artists = await Artist.find({ name: regex }).limit(limit);
      }

      if (types.includes('lyrics')) {
        lyrics = await Track.find({ lyric: { $regex: regex } })
          .populate({
            path: 'artist',
          })
          .limit(limit);
      }
  
      return {
        tracks,
        artists,
        lyrics
      };
    } catch (error) {
      console.log(error);
    }
  };

/* History Function */
const getHistories = async (user,startDate,endDate) => {
    if (startDate === undefined || endDate === undefined) {
        startDate = new Date('1971-01-01').toISOString();
        endDate = new Date().toISOString();
    } else {
        startDate = new Date(startDate).toISOString();
        endDate = new Date(endDate + "T23:59:59Z").toISOString();
    }
 
    try {
        const history = await History.find({
            user: user,
            createdAt: { $gte: startDate, $lte: endDate }
        })
        .populate({
            path: 'track',
            populate: {
                path: 'tags.tag',
                model: 'Tag'
            },
            populate: {
                path: 'artist',
                model: 'Artist'
            }
        })
        .populate({
            path: 'artist',
            populate: {
                path: 'tags.tag',
                model: 'Tag'
            }
        });
        return history;
    } catch (error) {
        console.log(error);
    }
}

const addHistory = async (newHistory) => {
    try {
        const history = History(
            {
                track: newHistory.track,
                artist: newHistory.artist,
                user: newHistory.user,
                duration: parseInt(newHistory.duration) || 0
            }
        )
        const savedHistory = await history.save()
        return savedHistory;
    } catch (error) {
        console.log(error);
    }
}

/* Tag Function */
const getAllTags = async (limit) => {
    try {
        // 聚合管道数组
        const pipeline = [
            {
                $sort: { count: -1, name: 1 } // 先按 count 字段降序，再按 name 字段升序排序
            }
        ];

        // 如果提供了 limit 参数，则添加 $limit 阶段
        if (limit) {
            pipeline.push({
                $limit: parseInt(limit)
            });
        }

        // 使用聚合框架执行聚合管道
        const tags = await Tag.aggregate(pipeline);

        return tags;
    } catch (error) {
        console.log(error);
    }
}

const getAllYears = async (limit) => {
    try {
        // 使用 MongoDB 的聚合框架进行操作
        const years = await Track.aggregate([
            {
                $group: {
                    _id: "$year",
                    year: { $first: "$year" } // 添加返回的年份字段
                }
            },
            {
                $project: {
                    _id: 0, // 不返回默认的 _id 字段
                    year: 1 // 返回年份字段
                }
            },
            {
                $sort: { year: 1 } // 对年份进行升序排序
            },
            {
                $limit: parseInt(limit) // 添加限制
            }
        ]);

        return years;
    } catch (error) {
        console.log(error);
    }
}

const getTagById = async (tag) => {
    try {
        return await Tag.findById(tag)
    } catch (error) {
        console.log(error);
    }
};


const getTagsByKeyword = async (keyword) => {
    try {
        const tags = await Tag.find({ name: { $regex: keyword, $options: 'i' } }, '_id name count')
            .sort({ count: -1 })  // Sort by count in descending order
            .limit(100);           // Limit the results to 100

        return tags.map(tag => ({ _id: tag._id, name: tag.name }));
    } catch (error) {
        console.log(error);
        throw error;  // Optionally rethrow the error to handle it further up the call stack
    }
};

/* PlayList Function */
const addPlayList = async (playList) => {
    try {
        let newPlayList = PlayList({
            name: playList.name,
            description: playList.description,
            cover: playList.cover,
            user: playList.user
        })
        return await newPlayList.save()
    } catch (error) {
        console.log(error);
    }
}

const addPlayListTrack = async (playListTrack) => {
    try {
        let newPlayListTrack = PlayListTrack({
            playList: playListTrack.playList,
            track: playListTrack.track,
            user: playListTrack.user
        })
        return await newPlayListTrack.save()
    } catch (error) {
        console.log(error);
    }
}

const deletePlayListTracks = async (user,playList,track) => {
    try {
        return await PlayListTrack.deleteOne({user: user, playList:playList,track:track})
    } catch (error) {
        console.log(error);
    }
}

const getPlayListTracks = async (user, playList) => {
    try {
        const playListTracks = await PlayListTrack.find({user: user, playList:playList}).populate("track")
        const tracksArray = playListTracks.map(item => item.track);
        return tracksArray;
    } catch (error) {
        console.log(error);
    }
}

const getPlayLists = async (user_id) => {
    try {
        return await PlayList.find({user: user_id})
    } catch (error) {
        console.log(error);
    }
}

const getPlayList = async (playList_id) => {
    try {
        return await PlayList.findOne({_id: playList_id})
    } catch (error) {
        console.log(error);
    }
}

/* User Function */
const getUser = async (id) => {
    try {
        const user = await User.findOne({_id: id}).populate("tags.tag");
        const { password, ...userWithoutPassword } = user.toObject();

        return userWithoutPassword;
    } catch (error) {
        console.log(error);
    }
};

const getUsers = async () => {
    try {
        return await User.find().populate("tags.tag");
    } catch (error) {
        console.log(error);
    }
};

const getUserByEmail = async (email) => {
    try {
        return await User.findOne({email: email});
    } catch (error) {
        console.log(error);
    }
};

const addUser = async (user) => {
    try {
        const newUser = User(
            {
                name: user.name,
                email: user.email,
                password: user.password,
                avatar: user.avatar,
            }
        )
        return await newUser.save()
    } catch (error) {
        console.log(error);
    }
};

const updateSpotifyRefreshToken = async (id, token) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { spotify_refresh_token: token },
            { new: true } // 返回更新后的文档
          );
      
          if (!updatedUser) {
            throw new Error('User not found');
          }
      
          console.log('Spotify refresh token updated successfully');
          return updatedUser;
    } catch (error) {
        console.log(error);
    }
};

/* Track Function */
const getAllTracks = async () => {
    try {
        return await Track.find().populate("artist");
    } catch (error) {
        console.log(error);
    }
};

const updateLyric = async (trackId, newLyric) => {
    try {
        const updatedTrack = await Track.findByIdAndUpdate(
            trackId, 
            { $set: { lyric: newLyric } }, 
            { new: true, useFindAndModify: false }
        );
        return updatedTrack;
    } catch (error) {
        console.error('Error updating track:', error);
        throw error;
    }
};

const getTracks = async () => {
    try {
        return await Track.find().populate("artist").populate("tags").populate("tags.tag").limit(50);
    } catch (error) {
        console.log(error);
    }
};

const getTracksByArtist = async (artist) => {
    try {
        return await Track.find({artist: artist}).populate("artist").populate("tags").populate("tags.tag").limit(50);
    } catch (error) {
        console.log(error);
    }
};

const getTracksByTag = async (tag) => {
    try {
        return await Track.find({ 'tags.tag': tag })
            .populate('artist')
            .populate('tags.tag')
            .limit(50);
    } catch (error) {
        console.log(error);
    }
};

const getTracksByTags = async (tags) => {
    // const tags = [
    //     mongoose.Types.ObjectId('60d5f9f9fc13ae1d3c000001'),
    //     mongoose.Types.ObjectId('60d5f9f9fc13ae1d3c000002')
    //   ];
    try {
        return await Track.find({ 'tags.tag': { $all: tags } })
            .populate('artist')
            .populate('tags.tag')
            .limit(50);
    } catch (error) {
        console.log(error);
        throw error; // Optionally rethrow the error to handle it further up the call stack
    }
};


const getTrackById = async (track) => {
    try {
        return await Track.findById(track)
            .populate({
                path: 'artist',
                populate: {
                    path: 'tags.tag'
                }
            })
            .populate('tags.tag');
    } catch (error) {
        console.log(error);
    }
};

const getRandomTracks = async () => {
    // Update Algorithm
    try {
        // 随机获取20个文档
        const randomTracks = await Track.aggregate([{ $sample: { size: 20 } }]);
        
        // 填充关联的数据
        const populatedTracks = await Track.populate(randomTracks, { path: "artist" });
        await Track.populate(populatedTracks, { path: "tags" });
        await Track.populate(populatedTracks, { path: "tags.tag" });

        return populatedTracks;
    } catch (error) {
        console.log(error);
    }
};

/* Artist Function */
const getArtist = async (id) => {
    // Update Algorithm
    try {
        return await Artist.findOne({_id:id}).populate("tags").populate("tags.tag");
    } catch (error) {
        console.log(error);
    }
};

const getRandomArtists = async () => {
    // Update Algorithm
    try {
        // 随机获取20个文档
        const randomArtists = await Artist.aggregate([{ $sample: { size: 20 } }]);
        
        // 填充关联的数据
        const populatedArtists = await Artist.populate(randomArtists, { path: "artist" });
        await Track.populate(populatedArtists, { path: "tags" });
        await Track.populate(populatedArtists, { path: "tags.tag" });

        return populatedArtists;

    } catch (error) {
        console.log(error);
    }
};

const getArtistsByTags = async (tags) => {
    // const tags = [
    //     mongoose.Types.ObjectId('60d5f9f9fc13ae1d3c000001'),
    //     mongoose.Types.ObjectId('60d5f9f9fc13ae1d3c000002')
    //   ];
    try {
        return await Artist.find({ 'tags.tag': { $all: tags } })
            .populate('tags')
            .populate('tags.tag')
            .limit(50);
    } catch (error) {
        console.log(error);
        throw error; // Optionally rethrow the error to handle it further up the call stack
    }
};
/* Rating Function */
const getRating = async (user,item,itemType) => {
    try {
        // 构建查询条件
        let query = {
            user: user,
            item: item,
            itemType: itemType
        };
        // 执行查询
        const rating = await Rating.findOne(query).populate('item');

        return rating;
    } catch (error) {
        console.error('Error in getRating:', error);
        throw error;
    }
}

const getRatings = async (user) => {
    try {
        // 执行查询
        const rating = await Rating.find({user: user}).populate('item');

        return rating;
    } catch (error) {
        console.error('Error in getRating:', error);
        throw error;
    }
}

const addRating = async (item) => {
    try {
        const filter = {
            user: item.user,
            item: item.item,
            itemType: item.itemType
        };

        const update = {
            $set: {
                rate: item.rate
            }
        };

        const options = {
            new: true,  // 返回更新后的文档
            upsert: true,  // 如果不存在则创建新文档
            runValidators: true,  // 确保更新操作也会运行验证器
            setDefaultsOnInsert: true  // 如果是新文档，设置默认值
        };

        const savedRating = await Rating.findOneAndUpdate(filter, update, options);
        return savedRating;
    } catch (error) {
        console.error('Error in addRating:', error);
        throw error;  // 将错误抛出，而不是直接返回
    }
};


/* Data Prepare Function */
const addArtist = async (artist)=>{
    try {
        var tags = JSON.parse(artist.tags)

        const newArtist = new Artist({
            id_string: artist.artist_id,
            name: artist.name,
            tags: [],
            familiarity: artist.familiarity,
            hotness: artist.hotness,
            ne_artist_id: artist.ne_artist_id,
            avatar: artist.avatar,
            summary: artist.summary,
            published: artist.published
        });

        if(tags != null){
            for (const tagInfo of tags) {
                const tag = await Tag.findOne({ name: tagInfo.name });
                if (tag) {
                    newArtist.tags.push({
                        tag: tag._id,
                        count: tagInfo.count
                    });
                }
            }
        }
        console.log(`Artist "${artist.name}" 已添加。`);
        return await newArtist.save()
        
    }catch(e){
        console.log(e);
        return
    }
}

const addTag = async (tag) => {
    try {
        const newTag = new Tag({
            name: tag.name,
            count: parseInt(tag.count)
        });
        const saveTag = await newTag.save();
        console.log(`标签 "${tag.name}" 已添加。`);
    } catch (error) {
        console.error('添加标签时出错：', error);
    }
};

const addTrack = async (track)=>{
    try{
        var tags = JSON.parse(track.tags)

        const newTrack = new Track({
            id_string: track.track_id,
            name: track.title,
            album: track.release,
            artist: null,
            year: track.year,
            ne_song_id: track.ne_song_id,
            cover: track.ne_song_cover,
            duration: track.ne_duration,
            lyric: track.ne_lyric,
            tags: [],
            summary: track.summary,
            published: track.published,
        });

        const artist = await Artist.findOne({ name: track.artist_name });
        if (artist) {
            newTrack.artist = artist._id;
        }

        if(tags != null){
            for (const tagInfo of tags) {
                const tag = await Tag.findOne({ name: tagInfo.name });
                if (tag) {
                    newTrack.tags.push({
                        tag: tag._id,
                        count: tagInfo.count
                    });
                }
            }
        }
        console.log(`Track "${track.title}" 已添加。`);
        return await newTrack.save()

    }catch(e){
        console.log(e);
    }
}

module.exports = {
    search,
    getHistories,
    addHistory,
    getAllTags,
    getAllYears,
    getTagById,
    getTagsByKeyword,
    addPlayList,
    addPlayListTrack,
    deletePlayListTracks,
    getPlayListTracks,
    getPlayLists,
    getPlayList,
    getUser,
    getUsers,
    getUserByEmail,
    addUser,
    updateSpotifyRefreshToken,
    addArtist,
    updateLyric,
    getAllTracks,
    addTrack,
    getTracksByArtist,
    getTrackById,
    getTracksByTag,
    getTracksByTags,
    addTag,
    getTracks,
    getRandomTracks,
    getRandomArtists,
    getArtistsByTags,
    getArtist,
    addRating,
    getRating,
    getRatings
}

