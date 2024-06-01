// const sqlite3 = require('sqlite3');
const db = require('../db/index')
const axios = require('axios');
const { log } = require('../utils/logger');

const mongodb = require("../model/mongodb")

exports.getRandomTracks = async (req, res) => {
  try{
    const tracks = await mongodb.getRandomTracks()
    return res.send({ status: 200, message: 'Success', data: tracks})
  }catch(e){
    return res.send({ status: 1, message: err.message })
  }
}

exports.getRecommArtist = async (req, res) => {
  try{
    const artists = await mongodb.getRandomArtists()
    return res.send({ status: 200, message: 'Success', data: artists})
  }catch(err){
    return res.send({ status: 1, message: err.message })
  }
};

// const sqliteDB = new sqlite3.Database('/Users/terenzzzz/Desktop/track_metadata.db');

// 从SQlite文件添加数据到Mysql
exports.queryMetadata = (req, res) => {
    // logger.log("queryMetadata")
    sqliteDB.all('SELECT * FROM songs WHERE year = 2005', (err, rows) => {
        if (err) {
            console.error(err.message);
            return;
        }
        // 遍历 SQLite 查询结果并将数据插入到 MySQL 数据库中
        rows.forEach((row) => {
          if(row.year >= 2005){
            db.query(
              'INSERT INTO Tracks (track_id, title, `release`, artist_id, artist_name, duration, artist_familiarity, artist_hotttnesss, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
              [row.track_id, row.title, row.release, row.artist_id, row.artist_name, row.duration, row.artist_familiarity, row.artist_hotttnesss, row.year], 
              (err, result) => {
                if (err) {
                  console.error('Error inserting row: ' + err.stack);
                  return;
                }
                console.log('Inserted row with ID ' + result.insertId);
              }
            );
          } 
        });
    }); 
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 请求网易云API，根据歌名歌手搜索获取网易云对应音乐id和其他原数据
exports.queryNetEase = async (req, res) => {
  try {
    const sqlQuery = `select * from Tracks`;
    const result = await new Promise((resolve, reject) => {
      db.query(sqlQuery, (err, result) => {
        if (err) {
          console.error('Error executing query:', err);
          reject(err);
          return;
        }
        resolve(result);
      });
    });

    var count = 0
    let totalCount = result.length
    
    for (const row of result) {
      if (row.id >= 217998 && row.ne_song_id == null) {
        try {
          const response = await axios.get(`http://localhost:3000/search?keywords=${row.artist_name} ${row.title}&limit=1`);
          if (response.data.result && response.data.result.songs && response.data.result.songs[0].album.name.length <= 225 ){
            let song = response.data.result.songs[0];
            // console.log(response.data.result);
            await new Promise((resolve, reject) => {
              db.query(
                'UPDATE Tracks SET ne_song_id = ?, ne_artist_id = ?, ne_duration = ?, ne_album_id = ?, ne_album_name = ? WHERE id = ?;', 
                [song.id, song.artists[0].id, song.duration, song.album.id, song.album.name, row.id], 
                (err, result) => {
                  if (err) {
                    console.error('Error updating row: ' + err.stack);
                    reject(err);
                    return;
                  }
                  count++
                  console.log(`Updated row with ID ${row.id}. (${count}/${totalCount})`);
                  resolve();
                }
              );
            });
          }
        } catch (error) {
          if (error.response) {
            console.error('Error making request:', error.response.data);
          } else {
            console.error('Error making request:', error);
          }
          
          console.log('Pausing for 5 minutes due to error...');
          await sleep(3000000); // 暂停五分钟
        }
        await sleep(10000); // 暂停 
      }else{
        count++
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// 请求网易云API，根据网易云音乐id获取对应音乐的歌词
exports.queryLyric = async (req, res) => {
  try {
    const sqlQuery = `select * from Tracks`;
    const result = await new Promise((resolve, reject) => {
      db.query(sqlQuery, (err, result) => {
        if (err) {
          console.error('Error executing query:', err);
          reject(err);
          return;
        }
        resolve(result);
      });
    });

    var count = 0
    let totalCount = result.length
    
    for (const row of result) {
      // console.log(row);
      if(row.ne_song_id != null && row.ne_lyric == null){
        try{
          const response = await axios.get(`http://localhost:3000/lyric?id=${row.ne_song_id}`);
          if (response.data.lrc){
            let lyric = response.data.lrc.lyric;
            let tlyric = "";
            if(response.data.tlyric){
              tlyric = response.data.tlyric.lyric
            }
             
            await new Promise((resolve, reject) => {
              db.query(
                'UPDATE Tracks SET ne_lyric = ?, ne_lyric_trans = ? WHERE id = ?;', 
                [lyric, tlyric, row.id], 
                (err, result) => {
                  if (err) {
                    console.error('Error updating row: ' + err.stack);
                    reject(err);
                    return;
                  }
                  count++
                  console.log(`Updated lyric row with ID ${row.id}. (${count}/${totalCount})`);
                  resolve();
                }
              );
            });
          }
        } catch (error) {
          if (error.response) {
            console.error('Error making request:', error.response.data);
          } else {
            console.error('Error making request:', error);
          }
          console.log('Pausing for 5 minutes due to error...');
          await sleep(3000000); // 暂停五分钟
        }
        await sleep(10000); // 暂停 
      }else{
        count++
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// 请求网易云API，根据网易云音乐id获取对应音乐的封面
exports.queryCover = async (req, res) => {
  try {
    const sqlQuery = `select * from Tracks`;
    const result = await new Promise((resolve, reject) => {
      db.query(sqlQuery, (err, result) => {
        if (err) {
          console.error('Error executing query:', err);
          reject(err);
          return;
        }
        resolve(result);
      });
    });

    var count = 0
    let totalCount = result.length
    
    for (const row of result) {
      // console.log(row);
      if(row.ne_song_id != null && row.ne_song_cover == null){
        try{
          const response = await axios.get(`http://localhost:3000/song/detail?ids=${row.ne_song_id}`);
          if (response.data.songs){
            let cover = response.data.songs[0].al.picUrl
            let songUrl = `https://music.163.com/song/media/outer/url?id=${row.ne_song_id}.mp3`
 
            await new Promise((resolve, reject) => {
              db.query(
                'UPDATE Tracks SET ne_song_url = ?, ne_song_cover = ? WHERE id = ?;', 
                [songUrl, cover, row.id], 
                (err, result) => {
                  if (err) {
                    console.error('Error updating row: ' + err.stack);
                    reject(err);
                    return;
                  }
                  count++
                  console.log(`Updated cover row with ID ${row.id}. (${count}/${totalCount})`);
                  resolve();
                }
              );
            });
          }
        } catch (error) {
          if (error.response) {
            console.error('Error making request:', error.response.data);
          } else {
            console.error('Error making request:', error);
          }
          console.log('Pausing for 5 minutes due to error...');
          await sleep(3000000); // 暂停五分钟
        }
        await sleep(10000); // 暂停 
      }else{
        count++
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
};



// 请求网易云API，根据网易云歌手id获取对应歌手的封面
exports.getArtistsCover = async (req, res) => {
  try {
    const sqlQuery = `select * from Artists`;
    const result = await new Promise((resolve, reject) => {
      db.query(sqlQuery, (err, result) => {
        if (err) {
          console.error('Error executing query:', err);
          reject(err);
          return;
        }
        resolve(result);
      });
    });

    var count = 0
    let totalCount = result.length
    
    for (const row of result) {
      // console.log(row);
      if(row.id >= "33340" && row.ne_artist_id != "0" && row.avatar == null){
        try{
          const response = await axios.get(`http://localhost:3000/artist/detail?id=${row.ne_artist_id}`);
          if (response.data.data){
            var avatar = response.data.data.artist.avatar;
            await new Promise((resolve, reject) => {
              db.query(
                'UPDATE Artists SET avatar = ? WHERE id = ?;', 
                [avatar,row.id], 
                (err, result) => {
                  if (err) {
                    console.error('Error updating row: ' + err.stack);
                    reject(err);
                    return;
                  }
                  count++
                  console.log(`Updated artist avatar row with ID ${row.id}. (${count}/${totalCount})`);
                  resolve();
                }
              );
            });
          }
        } catch (error) {
          if (error.response) {
            console.error('Error making request:', error.response.data);
          } else {
            console.error('Error making request:', error);
          }
          console.log('Pausing for 5 minutes due to error...');
          await sleep(3000000); // 暂停五分钟
        }
        await sleep(10000); // 暂停 
      }else{
        count++
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// 获取Tracks
exports.getTracks = (req, res) => {
  const limit = req.query.limit || 10;
  const sqlQuery = `select * from Tracks LIMIT ${limit}`;
  db.query(sqlQuery, function (err, results) {
    if (err) {
        return res.send({ status: 1, message: err.message })
    }

    return res.send({ status: 200, message: '注册成功', data: results})

  })
};


// 从last.fm获取Tracks Tags
exports.getTracksTags = async (req, res) => {
  try {
    const sqlQuery = `select * from Tracks`;
    const result = await new Promise((resolve, reject) => {
      db.query(sqlQuery, (err, result) => {
        if (err) {
          console.error('Error executing query:', err);
          reject(err);
          return;
        }
        resolve(result);
      });
    });

    var count = 0
    let totalCount = result.length
    
    for (const row of result) {   
      if(row.tags == null){
        try{
          const response = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=track.gettoptags&artist=${row.artist_name}&track=${encodeURIComponent(row.title)}&api_key=ee33544ab78d90ee804a994f3ac302b8&format=json`);
          if (response.data.toptags){
            var tags = response.data.toptags.tag.slice(0, 10); //限制最多十个标签
            tags = tags.map(obj => {
              // 使用解构赋值去掉 'url' 键值对
              const { url, ...rest } = obj;
              return rest;
            });
            await new Promise((resolve, reject) => {
              db.query(
                'UPDATE Tracks SET tags = ? WHERE id = ?;', 
                [JSON.stringify(tags), row.id], 
                (err, result) => {
                  if (err) {
                    console.error('Error updating row: ' + err.stack);
                    reject(err);
                    return;
                  }
                  count++
                  console.log(`Updated tags row with ID ${row.id}. (${count}/${totalCount})`);
                  resolve();
                }
              );
            });
          }
        } catch (error) {
          if (error.response) {
            console.error('Error making request:', error.response.data);
          } else {
            console.error('Error making request:', error);
          }
          console.log('Pausing for 5 minutes due to error...');
          await sleep(3000000); // 暂停五分钟
        }
        // await sleep(1000); // 暂停 
      }else{
        count++
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// 从last.fm获取artist Tags
exports.getArtistsTags = async (req, res) => {
  try {
    const sqlQuery = `select * from Artists`;
    const result = await new Promise((resolve, reject) => {
      db.query(sqlQuery, (err, result) => {
        if (err) {
          console.error('Error executing query:', err);
          reject(err);
          return;
        }
        resolve(result);
      });
    });

    var count = 0
    let totalCount = result.length
    
    for (const row of result) {   
      if(row.tags == null){
        try{
          const response = await axios.get(`https://ws.audioscrobbler.com/2.0/?method=artist.gettoptags&artist=${row.name}&api_key=ee33544ab78d90ee804a994f3ac302b8&format=json`);
          if (response.data.toptags){
            var tags = response.data.toptags.tag.slice(0, 10); //限制最多十个标签
            tags = tags.map(obj => {
              // 使用解构赋值去掉 'url' 键值对
              const { url, ...rest } = obj;
              return rest;
            });
            await new Promise((resolve, reject) => {
              db.query(
                'UPDATE Artists SET tags = ? WHERE id = ?;', 
                [JSON.stringify(tags), row.id], 
                (err, result) => {
                  if (err) {
                    console.error('Error updating row: ' + err.stack);
                    reject(err);
                    return;
                  }
                  count++
                  console.log(`Updated artist tags row with ID ${row.id}. (${count}/${totalCount})`);
                  resolve();
                }
              );
            });
          }
        } catch (error) {
          if (error.response) {
            console.error('Error making request:', error.response.data);
          } else {
            console.error('Error making request:', error);
          }
          console.log('Pausing for 5 minutes due to error...');
          await sleep(3000000); // 暂停五分钟
        }
        // await sleep(1000); // 暂停 
      }else{
        count++
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// 从last.fm获取artist wiki
exports.getArtistsWiki = async (req, res) => {
  try {
    const sqlQuery = `select * from Artists`;
    const result = await new Promise((resolve, reject) => {
      db.query(sqlQuery, (err, result) => {
        if (err) {
          console.error('Error executing query:', err);
          reject(err);
          return;
        }
        resolve(result);
      });
    });

    var count = 0
    let totalCount = result.length
    
    for (const row of result) {   
      if(row.summary == null){
        try{
          const response = await axios.get(`https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${row.name}&api_key=ee33544ab78d90ee804a994f3ac302b8&format=json`);
          if (response.data.artist){
            let summary = response.data.artist.bio.summary
            let published = response.data.artist.bio.published
            await new Promise((resolve, reject) => {
              db.query(
                'UPDATE Artists SET summary = ?, published = ? WHERE id = ?;', 
                [summary,published, row.id], 
                (err, result) => {
                  if (err) {
                    console.error('Error updating row: ' + err.stack);
                    reject(err);
                    return;
                  }
                  count++
                  console.log(`Updated artist WIKI row with ID ${row.id}. (${count}/${totalCount})`);
                  resolve();
                }
              );
            });
          }
        } catch (error) {
          if (error.response) {
            console.error('Error making request:', error.response.data);
          } else {
            console.error('Error making request:', error);
          }
          console.log('Pausing for 5 minutes due to error...');
          await sleep(3000000); // 暂停五分钟
        }
        // await sleep(1000); // 暂停 
      }else{
        count++
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// 从last.fm 获取 track wiki
exports.getTrackWiki = async (req, res) => {
  try {
    const sqlQuery = `select * from Tracks`;
    const result = await new Promise((resolve, reject) => {
      db.query(sqlQuery, (err, result) => {
        if (err) {
          console.error('Error executing query:', err);
          reject(err);
          return;
        }
        resolve(result);
      });
    });

    var count = 0
    let totalCount = result.length
    
    for (const row of result) {   
      if(row.id != null && row.summary == null && row.id >= "183371"){
        console.log(row.id);
        try{
          const response = await axios.get(`https://ws.audioscrobbler.com/2.0/?method=track.getinfo&artist=${row.artist_name}&track=${row.title}&api_key=ee33544ab78d90ee804a994f3ac302b8&format=json`);
          if (response.data.track && response.data.track.wiki){
            let summary = response.data.track.wiki.summary
            let published = response.data.track.wiki.published
            await new Promise((resolve, reject) => {
              db.query(
                'UPDATE Tracks SET summary = ?, published = ? WHERE id = ?;', 
                [summary,published, row.id], 
                (err, result) => {
                  if (err) {
                    console.error('Error updating row: ' + err.stack);
                    reject(err);
                    return;
                  }
                  count++
                  console.log(`Updated track WIKI row with ID ${row.id}. (${count}/${totalCount})`);
                  resolve();
                }
              );
            });
          }
        } catch (error) {
          if (error.response) {
            console.error('Error making request:', error.response.data);
          } else {
            console.error('Error making request:', error);
          }
          console.log('Pausing for 5 minutes due to error...');
          // await sleep(3000000); // 暂停五分钟
        }
        // await sleep(1000); // 暂停 
      }else{
        count++
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
};


/**
 * Import Into MongoDB
 */
exports.addArtistFromSqlToMongo = async (req,res) => {
  try {
    const sqlQuery = `select * from Artists`;
    const result = await new Promise((resolve, reject) => {
      db.query(sqlQuery, (err, result) => {
        if (err) {
          console.error('Error executing query:', err);
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  
    for (const row of result) {   
      try{
        var savedId = await mongodb.addArtist(row)
      }catch(e){
        console.log(e);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

exports.addTrackFromSqlToMongo = async (req,res) => {
  try {
    const sqlQuery = `select * from Tracks`;
    const result = await new Promise((resolve, reject) => {
      db.query(sqlQuery, (err, result) => {
        if (err) {
          console.error('Error executing query:', err);
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  
    for (const row of result) {   
      try{
        var savedId = await mongodb.addTrack(row)
      }catch(e){
        console.log(e);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

exports.addTrackTag = async (req,res) => {
  try {
    const sqlQuery = `select * from Artists`;
    const result = await new Promise((resolve, reject) => {
      db.query(sqlQuery, (err, result) => {
        if (err) {
          console.error('Error executing query:', err);
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  
    for (const row of result) {   
      if (row.tags) {
        try {
            const tags = JSON.parse(row.tags);
            if (Array.isArray(tags) && tags.length > 0) {
                tags.forEach(async tag => {
                    
                    var savedId = await mongodb.addTag(tag);
                    console.log(savedId);
                    
                });
            }
        } catch (error) {
            console.error('解析 JSON 字符串时出错：', error);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}