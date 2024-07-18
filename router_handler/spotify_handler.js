const logger = require('../utils/logger');
const axios = require('axios');
const mongodb = require("../model/mongodb");
const querystring = require('querystring');
const crypto = require('crypto');
const { log } = require('console');
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URL;
const {getLyric} = require('../router_handler/genius_handler')
const {getTrackTagsFromLastfm, getArtistTagsFromLastfm} = require('../router_handler/tag_handler')

const generateRandomString = (length) => {
  return crypto
    .randomBytes(60)
    .toString('hex')
    .slice(0, length);
}

const stateKey = 'spotify_auth_state';

exports.login = async (req, res) => {
  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  const scope = 'user-read-private user-read-email user-read-playback-state '
  + 'user-read-recently-played user-top-read user-follow-read user-follow-modify '
  + 'user-read-currently-playing playlist-read-private playlist-read-collaborative ' 
  + 'streaming user-modify-playback-state playlist-modify-public user-library-read'

  const queryString = querystring.stringify({
    response_type: 'code',
    client_id: client_id,
    scope: scope,
    redirect_uri: redirect_uri,
    state: state,
    show_dialog: true // 提示显示登录对话框
  });

  res.redirect('https://accounts.spotify.com/authorize?' + queryString);
};

exports.callback = async (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;

  // if (state === null || state !== storedState) {
  //   res.redirect('/#' +
  //     querystring.stringify({
  //       error: 'state_mismatch'
  //     }));
  // } else {
    res.clearCookie(stateKey);

    try {
      const response = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
        }
      });

      const access_token = 'Bearer ' + response.data.access_token;
      const refresh_token = response.data.refresh_token;

      // 将令牌传递给浏览器以便从前端进行请求
      res.redirect(`${process.env.SPOTIFY_REDIRECT_FRONT_END_URL}?` +
        querystring.stringify({
          access_token: access_token,
          refresh_token: refresh_token
        }));
    } catch (error) {
      console.error('Error getting tokens:', error);
      res.redirect('/#' +
        querystring.stringify({
          error: 'invalid_token'
        }));
    }
  // }
};

exports.refresh_token = async (req, res) => {
  const refresh_token = req.query.refresh_token;

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
      }
    });

    const access_token = response.data.access_token;
    res.send({
      'access_token': 'Bearer ' + access_token,
      'refresh_token': refresh_token
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).send('Failed to refresh token');
  }
};

exports.recentlyPlayed = async (req, res) => {
  const accessToken = req.query.access_token || req.headers.authorization;
  let tracks = []

  if (!accessToken) {
    return res.status(400).send({ error: 'Access token is required' });
  }

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/player/recently-played?limit=50', {
      headers: { 'Authorization': accessToken }
    });
    if (response.status === 200 && response.data) {
      let data = response.data.items
      // 处理Spotify返回的数据
      for (let track of data){
        track = track.track
        trackStructured = {
          _id: track.id,
          uri: track.uri,
          name: track.name,
          artist: track.artists[0],
          cover: track.album.images[0].url,
          album: track.album.name,
          duration: track.duration_ms,
          year: track.album.release_date,
          external_urls: track.external_urls.spotify,
        }
        tracks.push(trackStructured)
      }
      return res.status(200).send(tracks);
    } else if (response.status === 204) {
      // No content, meaning no song is currently playing
      return res.status(204).send({ message: 'No content, no song is currently playing' });
    } else {
      return res.status(response.status).send({ error: 'Failed to get recently played tracks' });
    }
  } catch (error) {
    console.error('Error fetching recently played tracks:', error.message);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};

exports.savedTracks = async (req, res) => {
  const accessToken = req.query.access_token || req.headers.authorization;
  let tracks = []

  if (!accessToken) {
    return res.status(400).send({ error: 'Access token is required' });
  }

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/tracks?limit=50', {
      headers: { 'Authorization': accessToken }
    });
    if (response.status === 200 && response.data) {
      let data = response.data.items

      // 处理Spotify返回的数据
      for (let track of data){
        track = track.track
        trackStructured = {
          _id: track.id,
          uri: track.uri,
          name: track.name,
          artist: track.artists[0],
          cover: track.album.images[0].url,
          album: track.album.name,
          duration: track.duration_ms,
          year: track.album.release_date,
          external_urls: track.external_urls.spotify,
        }
        tracks.push(trackStructured)
      }
      return res.status(200).send(tracks);
    } else if (response.status === 204) {
      // No content, meaning no song is currently playing
      return res.status(204).send({ message: 'No content' });
    } else {
      return res.status(response.status).send({ error: 'Failed to get saved Tracks' });
    }
  } catch (error) {
    console.error('Error fetching saved tracks:', error);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};

exports.topTracks = async (req, res) => {
  const accessToken = req.query.access_token || req.headers.authorization;
  let tracks = []

  if (!accessToken) {
    return res.status(400).send({ error: 'Access token is required' });
  }

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=50', {
      headers: { 'Authorization': accessToken }
    });
    if (response.status === 200 && response.data) {
      let data = response.data.items
      // 处理Spotify返回的数据
      for (let track of data){
        trackStructured = {
          _id: track.id,
          uri: track.uri,
          name: track.name,
          artist: track.artists[0],
          cover: track.album.images[0].url,
          album: track.album.name,
          duration: track.duration_ms,
          year: track.album.release_date,
          external_urls: track.external_urls.spotify,
        }
        tracks.push(trackStructured)
      }
      return res.status(200).send(tracks);
    } else if (response.status === 204) {
      // No content, meaning no song is currently playing
      return res.status(204).send({ message: 'No content, no song is currently playing' });
    } else {
      return res.status(response.status).send({ error: 'Failed to get currently playing track' });
    }
  } catch (error) {
    console.error('Error fetching currently playing track:', error);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};

exports.topArtists = async (req, res) => {
  const accessToken = req.query.access_token || req.headers.authorization;
  let artists = []

  if (!accessToken) {
    return res.status(400).send({ error: 'Access token is required' });
  }

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/top/artists?limit=50', {
      headers: { 'Authorization': accessToken }
    });
    if (response.status === 200 && response.data) {
      let data = response.data.items
      for (let artist of data ){

        artistStructured = {
          _id: artist.id,
          avatar: artist.images[0].url,
          tags: artist.genres.map((tag) => ({tag:{
            name: tag,
          }})),
          name: artist.name,
          hotness: artist.popularity/100,
          external_urls: artist.external_urls.spotify
        }
        artists.push(artistStructured)
      }
        
      // 处理Spotify返回的数据
      return res.status(200).send(artists);
    } else if (response.status === 204) {
      // No content, meaning no song is currently playing
      return res.status(204).send({ message: 'No content, no song is currently playing' });
    } else {
      return res.status(response.status).send({ error: 'Failed to get currently playing track' });
    }
  } catch (error) {
    console.error('Error fetching currently playing track:', error);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};

exports.searchArtists = async (req, res) => {
  const accessToken = req.query.access_token || req.headers.authorization;

  const keyword = req.query.q
  const artists = []

  if (!accessToken) {
    return res.status(400).send({ error: 'Access token is required' });
  }

  try {
    const response = await axios.get(`https://api.spotify.com/v1/search?q=${keyword}&type=artist`, {
      headers: { 'Authorization': accessToken }
    });
    if (response.status === 200 && response.data) {
      let data = response.data.artists.items
      for (let artist of data ){
        artistStructured = {
          _id: artist.id,
          avatar: artist.images[0]? artist.images[0].url : "",
          tags: artist.genres.map((tag) => ({tag:{
            name: tag,
          }})),
          name: artist.name,
          hotness: artist.popularity/100,
          external_urls: artist.external_urls.spotify
        }
        artists.push(artistStructured)
      }
        
      // 处理Spotify返回的数据
      return res.status(200).send(artists);
    } else if (response.status === 204) {
      // No content, meaning no song is currently playing
      return res.status(204).send({ message: 'No content, no song is currently playing' });
    } else {
      return res.status(response.status).send({ error: 'Failed to get currently playing track' });
    }
  } catch (error) {
    console.error('Error fetching search result:', error);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};

exports.searchTracks = async (req, res) => {
  const accessToken = req.query.access_token || req.headers.authorization;

  const keyword = req.query.q
  const tracks = []

  if (!accessToken) {
    return res.status(400).send({ error: 'Access token is required' });
  }

  try {
    const response = await axios.get(`https://api.spotify.com/v1/search?q=${keyword}&type=track`, {
      headers: { 'Authorization': accessToken }
    });
    if (response.status === 200 && response.data) {
      let data = response.data.tracks.items
      // 处理Spotify返回的数据
      for (let track of data){
        trackStructured = {
          _id: track.id,
          uri: track.uri,
          name: track.name,
          artist: track.artists[0],
          cover: track.album.images[0].url,
          album: track.album.name,
          duration: track.duration_ms,
          year: track.album.release_date,
          external_urls: track.external_urls.spotify,
        }
        tracks.push(trackStructured)
      }
      return res.status(200).send(tracks);
    } else if (response.status === 204) {
      // No content, meaning no song is currently playing
      return res.status(204).send({ message: 'No content, no song is currently playing' });
    } else {
      return res.status(response.status).send({ error: 'Failed to get currently playing track' });
    }
  } catch (error) {
    console.error('Error fetching search result:', error);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};

exports.getSpotifyTrackById = async (req, res) => {
  const accessToken = req.query.access_token || req.headers.authorization;

  if (!accessToken) {
    return res.status(400).send({ error: 'Access token is required' });
  }

  try {
    const id = req.query.id
    let artist = {}
    let track = {}
    let lyric = ""
    // 查询Spotify中track的元数据
    const response = await axios.get(`https://api.spotify.com/v1/tracks/${id}`, {
      headers: { 'Authorization': accessToken }
    });
    if (response.status === 200 && response.data) {
      let data = response.data
      let artistHref = data.artists[0].href // 歌手链接
      // 根据查询到的track中的歌手链接获取歌手信息
      const artistResponse = await axios.get(artistHref, {
        headers: { 'Authorization': accessToken }
      });
      // 处理艺人信息
      if (artistResponse.status === 200 && artistResponse.data) {
        let artistData = artistResponse.data
        var artistTag = await getArtistTagsFromLastfm(artistData.name)
        artistTag = await converTagExitInDb(artistTag)
        artist = {
          id: artistData.id,
          avatar: artistData.images[0].url,
          tags: artistTag,
          name: artistData.name,
          hotness: artistData.popularity/100,
          external_urls: artistData.external_urls.spotify
        }
      }
      // 查询歌词
      lyric = await getLyric(artist.name, data.name)
      trackTag = await getTrackTagsFromLastfm(artist.name,data.name)
      trackTag = await converTagExitInDb(trackTag)
      

      // 结构化track
      track = {
        id: data.id,
        uri: data.uri,
        name: data.name,
        artist: artist,
        cover: data.album.images[0].url,
        album: data.album.name,
        duration: data.duration_ms,
        year: data.album.release_date,
        external_urls: data.external_urls.spotify,
        lyric: lyric,
        tags: trackTag
      }
      // 处理Spotify返回的数据
      return res.status(200).send(track);
    } else {
      return res.status(response.status).send({ error: 'Failed to get currently playing track' });
    }
  } catch (e) {
    return res.status(400).json({ status: 1, message: e });
  }
};

exports.getSpotifyArtistById = async (req, res) => {
  const accessToken = req.query.access_token || req.headers.authorization;

  if (!accessToken) {
    return res.status(400).send({ error: 'Access token is required' });
  }

  try {
    const id = req.query.id
    let artist = {}
    let tracks = []
    // 查询Spotify中track的元数据
    const response = await axios.get(`https://api.spotify.com/v1/artists/${id}`, {
      headers: { 'Authorization': accessToken }
    });
    if (response.status === 200 && response.data) {
      let data = response.data
      // 结构化artist
      artist = {
        id: data.id,
        avatar: data.images[0].url,
        tags: data.genres.map((tag) => ({tag:{
          name: tag,
        }})),
        name: data.name,
        hotness: data.popularity/100,
        external_urls: data.external_urls.spotify
      }
      const topTrackResponse = await axios.get(`https://api.spotify.com/v1/artists/${id}/top-tracks`, {
        headers: { 'Authorization': accessToken }
      });
      if (topTrackResponse.status === 200 && topTrackResponse.data) {
        let tracksData = topTrackResponse.data.tracks
        tracksData.forEach(track => {
          // 结构化track
          let singleTrack = {
            _id: track.id,
            uri: track.uri,
            name: track.name,
            artist: artist,
            cover: track.album.images[0].url,
            external_urls: track.external_urls.spotify,
          }
          tracks.push(singleTrack);
        })
      }
      // 处理Spotify返回的数据
      return res.status(200).send({artist,tracks});
    } else {
      return res.status(response.status).send({ error: 'Failed to fetching artist by id' });
    }
  } catch (error) {
    console.error('Error fetching artist by id:', error);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};

exports.getArtistRelatedArtists = async (req, res) => {
  const accessToken = req.query.access_token || req.headers.authorization;

  if (!accessToken) {
    return res.status(400).send({ error: 'Access token is required' });
  }

  try {
    const id = req.query.id
    let artists = []

    // 查询Spotify中track的元数据
    const response = await axios.get(`https://api.spotify.com/v1/artists/${id}/related-artists`, {
      headers: { 'Authorization': accessToken }
    });
    if (response.status === 200 && response.data) {
      let data = response.data.artists
      data.forEach(artist => {
      // 结构化artist
        artist = {
          _id: artist.id,
          avatar: artist.images[0].url,
          tags: artist.genres.map((tag) => ({tag:{
            name: tag,
          }})),
          name: artist.name,
          hotness: artist.popularity/100,
          external_urls: artist.external_urls.spotify
        }
        artists.push(artist)
      })
      // 处理Spotify返回的数据
      return res.status(200).send(artists);
    } else {
      return res.status(response.status).send({ error: 'Failed to fetching artist by id' });
    }
  } catch (error) {
    console.error('Error fetching artist by id:', error);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};


converTagExitInDb = async (tags) =>{
  // 使用 Promise.all 和 map 来并行处理所有标签
  tags = await Promise.all(tags.map(async (tag) => {
    const dbTag = await mongodb.searchTagByName(tag.name);
    if (dbTag) {
      // 如果在数据库中找到标签，使用数据库中的 _id 和 name，但保留原始的 count
      return {
        tag: dbTag,
        count: tag.count
      };
    }
    return dbTag; // 如果在数据库中找到标签，返回数据库中的标签，否则返回 null
  }));
  
  // 过滤掉 null 值，即删除未在数据库中找到的标签
  tags = tags.filter(tag => tag !== null);

  return tags
}
