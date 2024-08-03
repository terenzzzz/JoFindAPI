const axios = require('axios');
const cheerio = require('cheerio-without-node-native');

exports.getLyricsFromGenius = async (req, res) => {
    try {
      const artistName =req.query.artist;
      const trackName = req.query.track;

      //获取所有的曲目
      let {lyricAPI,lyric} = await this.getLyric(trackName,artistName)
      return res.send({ status: 200, message: 'Success', data:{lyricAPI,lyric}});
      
        
    } catch (err) {
        // 捕获和处理错误
        return res.send({ status: 1, message: err.message });
    }
  };

exports.getLyric = async(trackName,artistName) => {
  try {
    
    const base_api_url = "https://api.genius.com"
    const base_url = "https://genius.com" 
    const access_token = process.env.GENIUS_ACCESS_TOKEN || "";

    let lyricAPI = ""
    let lyric = ""

    const cleanedTrackName = trackName.replace(/\(.*?\)|\[.*?\]/g, '').trim();
    console.log(`Get lyric for Track: ${cleanedTrackName} : Aritst: ${artistName}`);
    const api = `${base_api_url}/search?q=${cleanedTrackName} ${artistName}`

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
        if (lyric === ""){
          console.log("Try ovh");
          lyric = await getLyricFromLyricsOVH(cleanedTrackName, artistName)
        }
      }
    } catch (apiError) {
      console.error(`Error fetching lyrics for ${cleanedTrackName} - ${artistName}: ${apiError.message}`);
    }
    return {lyricAPI,lyric}
} catch (err) {
    // 捕获和处理错误
    return res.send({ status: 1, message: err.message });
}
};


extractLyrics = async(url) => {
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
		return "";
	}
};

getLyricFromLyricsOVH = async(trackName,artistName) => {
  try {
    try {
      const api = `https://api.lyrics.ovh/v1/${artistName}/${trackName}`
      response = await axios.get(api)
      return response.data.lyrics
    } catch (apiError) {
      console.error(`Error fetching lyrics for ${cleanedTrackName} - ${artistName}: ${apiError.message}`);
    }
    return {response}
} catch (err) {
    // 捕获和处理错误
    return ""
}
};