const logger = require('../utils/logger');
const axios = require('axios');
const mongodb = require("../model/mongodb");
const querystring = require('querystring');
const crypto = require('crypto');
const express = require('express');
const { log } = require('console');
const artist = require('../model/schema/artist');
const router = express.Router();

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URL;

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
  + 'streaming user-modify-playback-state playlist-modify-public'

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

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
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

      // 使用访问令牌访问Spotify Web API
      // const userInfo = await axios.get('https://api.spotify.com/v1/me', {
      //   headers: { 'Authorization': access_token }
      // });

      // console.log(userInfo.data);

      // 将令牌传递给浏览器以便从前端进行请求
      res.redirect('http://localhost:8080/#/profile?' +
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
  }
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

  if (!accessToken) {
    return res.status(400).send({ error: 'Access token is required' });
  }

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/player/recently-played', {
      headers: { 'Authorization': accessToken }
    });
    if (response.status === 200 && response.data) {
      let data = response.data.items
      // 处理Spotify返回的数据
      return res.status(200).send(data);
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

exports.topTracks = async (req, res) => {
  const accessToken = req.query.access_token || req.headers.authorization;

  if (!accessToken) {
    return res.status(400).send({ error: 'Access token is required' });
  }

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
      headers: { 'Authorization': accessToken }
    });
    if (response.status === 200 && response.data) {
      let data = response.data.items
      // 处理Spotify返回的数据
      return res.status(200).send(data);
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

  if (!accessToken) {
    return res.status(400).send({ error: 'Access token is required' });
  }

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/top/artists', {
      headers: { 'Authorization': accessToken }
    });
    if (response.status === 200 && response.data) {
      let data = response.data.items
      // 处理Spotify返回的数据
      return res.status(200).send(data);
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

exports.search = async (req, res) => {
  const accessToken = req.query.access_token || req.headers.authorization;

  const keyword = req.query.q
  const type = req.query.type

  if (!accessToken) {
    return res.status(400).send({ error: 'Access token is required' });
  }

  try {
    const response = await axios.get(`https://api.spotify.com/v1/search?q=${keyword}&type=${type}`, {
      headers: { 'Authorization': accessToken }
    });
    if (response.status === 200 && response.data) {

      let data = response.data.tracks.items[0]
      console.log(data);
      // 处理Spotify返回的数据
      return res.status(200).send(data);
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
      if (artistResponse.status === 200 && artistResponse.data) {
        let artistData = artistResponse.data
        artist = {
          id: artistData.id,
          avatar: artistData.images[0].url,
          tags: artistData.genres.map((tag) => ({tag:{
            name: tag,
          }})),
          name: artistData.name,
          hotness: artistData.popularity/100,
          external_urls: artistData.external_urls.spotify
        }
      }
      // 查询歌词
      lyric = await getLyric(artist.name, data.name)

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
        lyric: lyric
      }
      // 处理Spotify返回的数据
      return res.status(200).send(track);
    } else {
      return res.status(response.status).send({ error: 'Failed to get currently playing track' });
    }
  } catch (error) {
    console.error('Error fetching currently playing track:', error);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};

async function getLyric(artistName,trackName){
  const api = `https://api.lyrics.ovh/v1/${artistName}/${trackName}`;  
  try {
    const response = await axios.get(api);
    if(response.data.lyrics){
      return response.data.lyrics;
    }
    
  } catch (apiError) {
    return apiError
  }
}