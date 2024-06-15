//导入express
const express = require('express')
// 创建路由对象
const router = express.Router()

//导入处理函数
const spotifyHandler = require('../router_handler/spotify_handler')


router.get('/spotifyLogin', spotifyHandler.login)
router.get('/spotifyCallback', spotifyHandler.callback)
router.get('/spotifyRefreshToken', spotifyHandler.refresh_token)

router.get('/getRecentlyPlayed', spotifyHandler.recentlyPlayed)
router.get('/getTopTracks', spotifyHandler.topTracks)
router.get('/getTopArtists', spotifyHandler.topArtists)
router.get('/searchTracks', spotifyHandler.searchTracks)
router.get('/searchArtists', spotifyHandler.searchArtists)
router.get('/getSpotifyTrackById', spotifyHandler.getSpotifyTrackById)
router.get('/getSpotifyArtistById', spotifyHandler.getSpotifyArtistById)
router.get('/getArtistRelatedArtists', spotifyHandler.getArtistRelatedArtists)
router.get('/getSavedTracks', spotifyHandler.savedTracks)


//共享
module.exports = router