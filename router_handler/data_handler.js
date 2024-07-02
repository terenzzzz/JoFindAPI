// const sqlite3 = require('sqlite3');
const db = require('../db/index')
const axios = require('axios');
const { log } = require('../utils/logger');

const mongodb = require("../model/mongodb")
require('dotenv').config()
const cheerio = require('cheerio-without-node-native');

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

async function updateTracksTags() {
  const tracks = await mongodb.getAllTracks();
  const referenceDate = new Date('2024-06-24T00:00:00.000Z');
  const tags = await mongodb.getAllTags()

  const tagMap = new Map(tags.map(tag => [tag.name.toLowerCase(), tag]));

  for (let track of tracks) {
    if (new Date(track.updatedAt) > referenceDate) {
      try{
        const response = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=track.gettoptags&artist=${encodeURIComponent(track.artist.name)}&track=${encodeURIComponent(track.name)}&api_key=ee33544ab78d90ee804a994f3ac302b8&format=json`);
        if (response.data.toptags){
          var toptags = response.data.toptags.tag.slice(0, 10); //限制最多十个标签
          toptags = toptags.map(obj => {
            // 使用解构赋值去掉 'url' 键值对
            const { url, ...rest } = obj;
            return rest;
          });
          
          const updatedTags = await Promise.all(toptags.map(async (tagInfo) => {
            // 在现有标签中查找匹配的标签
            const lowerCaseName = tagInfo.name.toLowerCase();
            let existingTag = tagMap.get(lowerCaseName);
            
            if (existingTag) {
              // 如果找到匹配的标签，使用现有的标签 ID
              // console.log("existing Tags: " + tagInfo.name);
              return {
                tag: existingTag._id,
                name: tagInfo.name,
                count: Number(tagInfo.count)
              };
            } else {
              // 如果没有找到匹配的标签，创建新的标签
              // console.log("new Tags: " + tagInfo.name);
              const newTag = await mongodb.addTag({ name: tagInfo.name, count: tagInfo.count });
              tags.push(newTag); // 将新标签添加到 allTags 数组中
              return {
                tag: newTag._id,
                name: tagInfo.name,
                count: Number(tagInfo.count)
              };
            }
          }));


          
          // // 更新 track 的 tags 字段
          const updatedTrack = await mongodb.updateTrackTags(track._id, updatedTags);
          console.log(updatedTrack.name);
        }

      } catch (error) {
        if (error.response) {
          console.error('Error making request:', error.response.data);
        } else {
          console.error('Error making request:', error);
        }
      }
    }
  }
}
updateTracksTags()


exports.updateLyricsFromGenius = async (req, res) => {
  try {
    const base_api_url = "https://api.genius.com"
    const base_url = "https://genius.com" 
    const access_token = process.env.GENIUS_ACCESS_TOKEN || "";

      //获取所有的曲目
      const tracks = await mongodb.getAllTracks();
      let success = 0
      let failed = 0
      let length = tracks.length

      const referenceDate = new Date('2024-06-10T00:00:00.000Z');
      
      //遍历所有曲目
      for (let track of tracks) {
          const trackDate = new Date(track.updatedAt);
          const artistName = track.artist.name;
          const trackName = track.name;

          if (trackDate < referenceDate) {
          
            // 调用第三方API获取歌词
            const api = `${base_api_url}/search?q=${trackName} ${artistName}`

            try {
              const response = await axios.get(api, {
                headers: {
                    'Authorization': access_token
                }
              });
              if(response.data.response.hits){
                const firstResult = response.data.response.hits[0]
                const lyricPath = firstResult.result.path
                lyricAPI = `${base_url}${lyricPath}`
                lyric = await extractLyrics(lyricAPI)    
                await mongodb.updateLyric(track._id, lyric)
                success++
              }
            } catch (apiError) {
              console.error(`Error fetching lyrics for ${trackName} - ${artistName}: ${apiError.message}`);
              failed++
            }
          }
          
          console.log(`${success+failed} / ${length} with success: ${success} : failed: ${failed} ${artistName} - ${trackName}`);
      }

      return res.send({ status: 200, message: 'Success'});
  } catch (err) {
      // 捕获和处理错误
      return res.send({ status: 1, message: err.message });
  }
};

async function extractLyrics (url) {
	try {
		let { data } = await axios.get(url);
		const $ = cheerio.load(data);
		let lyrics = $('div[class="lyrics"]').text().trim();
		if (!lyrics) {
			lyrics = '';
			$('div[class^="Lyrics__Container"]').each((i, elem) => {
				if ($(elem).text().length !== 0) {
					let snippet = $(elem)
						.html()
						.replace(/<br>/g, '\n')
						.replace(/<(?!\s*br\s*\/?)[^>]+>/gi, '');
					lyrics += $('<textarea/>').html(snippet).text().trim() + '\n\n';
				}
			});
		}
		if (!lyrics) return null;
		return lyrics.trim();
	} catch (e) {
		throw e;
	}
};



exports.updateLyricsFromThirdParty = async (req, res) => {
  try {
      //获取所有的曲目
      const tracks = await mongodb.getAllTracks();
      let success = 0
      let failed = 0
      let length = tracks.length
      
      //遍历所有曲目
      for (let track of tracks) {
          const artistName = track.artist.name;
          const trackName = track.name;
          
          // 调用第三方API获取歌词
          const api = `https://api.lyrics.ovh/v1/${artistName}/${trackName}`;
          
          try {
            
            const response = await axios.get(api);
            if(response.data.lyrics){
              const newLyric = response.data.lyrics;

              // 更新曲目的歌词
              await mongodb.updateLyric(track._id, newLyric)
              success++
            }
            
          } catch (apiError) {
              // console.error(`Error fetching lyrics for ${artistName} - ${trackName}: ${apiError.message}`);
              // 这里可以选择是否继续更新其他曲目
              failed++
          }
          console.log(`${success+failed} / ${length} with success: ${success} : failed: ${failed} ${artistName} - ${trackName}`);
      }

      return res.send({ status: 200, message: 'Success', data: updated });

      
  } catch (err) {
      // 捕获和处理错误
      return res.send({ status: 1, message: err.message });
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

/**
 * Process Lyrics_dataset
 */
const fs = require('fs');


structureArtist = async (req, res) => {
  fs.readFile('/Users/terenzzzz/Desktop/MusicBuddyAPI/json/Lyrics_TaylorSwift.json', 'utf8', async (err, data) => {
    if (err) {
        console.error('读取文件时出错:', err);
        return;
    }
    try {
      let jsonData = JSON.parse(data);
        let artist_summary = jsonData.description
        let artist_name = jsonData.name
        let avatar = jsonData.image_url
        let published = ""

        let response = await axios.get(`https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${artist_name}&api_key=ee33544ab78d90ee804a994f3ac302b8&format=json`);
        if (response.data.artist){
          artist_summary = response.data.artist.bio.summary
          published = response.data.artist.bio.published
        }

        response = await axios.get(`https://ws.audioscrobbler.com/2.0/?method=artist.gettoptags&artist=${artist_name}&api_key=ee33544ab78d90ee804a994f3ac302b8&format=json`);
        if (response.data.toptags){
          var tags = response.data.toptags.tag.slice(0, 10); //限制最多十个标签
          tags = tags.map(obj => {
            // 使用解构赋值去掉 'url' 键值对
            const { url, ...rest } = obj;
            return rest;
          });
        }

        let newArtist = {
          name: artist_name,
          tags: JSON.stringify(tags),
          familiarity: 0,
          hotness: 0,
          avatar: avatar,
          summary: artist_summary,
          published: published
        };

        await mongodb.addArtist(newArtist)


      } catch (err) {
        console.error('解析 JSON 出错:', err);
      }
    })
};

structureTrack = async (req, res) => {
  fs.readFile('/Users/terenzzzz/Desktop/MusicBuddyAPI/json/Lyrics_PostMalone.json', 'utf8', async (err, data) => {
    if (err) {
        console.error('读取文件时出错:', err);
        return;
    }
    try {
      let jsonData = JSON.parse(data);

          let artist_name = jsonData.name

          jsonData.songs.forEach(async json =>{
            const track_summary = json.description.plain
            const track_title = json.title
            const track_release = json.release_date
            const track_cover = json.header_image_url
            const track_lyrics = json.lyrics
            const album_name = json.album?.name
            let tags = []

            

            const response = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=track.gettoptags&artist=${artist_name}&track=${encodeURIComponent(track_title)}&api_key=ee33544ab78d90ee804a994f3ac302b8&format=json`);
            if (response.data.toptags){
              tags = response.data.toptags.tag.slice(0, 10); //限制最多十个标签
              tags = tags.map(obj => {
                // 使用解构赋值去掉 'url' 键值对
                const { url, ...rest } = obj;
                return rest;
              });
            }


            const track = {
              name: track_title,
              artist: artist_name,
              cover: track_cover,
              album: album_name,
              duration: 0,
              summary: track_summary,
              year: "",
              published: track_release,
              lyric: track_lyrics,
              tags: JSON.stringify(tags)
            }

            console.log(track.artist)
            await mongodb.addTrack(track)
        })
      } catch (err) {
        console.error('解析 JSON 出错:', err);
      }
    })
};

// structureTrack()
// structureArtist()


// 读取 JSON 文件
// fs.readFile('/Users/terenzzzz/Desktop/MusicBuddyAPI/json/Lyrics_Beyonc.json', 'utf8', (err, data) => {
//     if (err) {
//         console.error('读取文件时出错:', err);
//         return;
//     }
//     try {
//         const jsonData = JSON.parse(data);
//         const artist_summary = jsonData.description
//         const artist_name = jsonData.name
//         const avatar = jsonData.image_url

//         jsonData.songs.slice(0, 1).forEach(json =>{
//           const track_summary = json.description.plain
//           const track_title = json.title
//           const track_release = json.release_date
//           const track_cover = json.header_image_url
//           const track_lyrics = json.lyrics

//           // const album_name = json.album.name

//           artist = {
//             avatar: avatar,
//             summary: artist_summary,
//             name: artist_name,
//           }

//           track = {
//             name: track_title,
//             // artist: artist,
//             cover: track_cover,
//             // album: data.album.name,
//             // duration: data.duration_ms,
//             summary: track_summary,
//             published: track_release,
//             lyric: track_lyrics
//           }
//         })
//     } catch (err) {
//         console.error('解析 JSON 出错:', err);
//     }
// })

