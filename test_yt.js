const axios = require('axios');
const API_KEY = 'AIzaSyDiYXQn7JkitSBVpaHOiemqwrHW8OupPPI';

async function testYT() {
    try {
        const res = await axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=DD%20Kisan&type=channel&key=${API_KEY}`);
        console.log("Channel ID:", res.data.items[0].id.channelId);
        const channelId = res.data.items[0].id.channelId;

        const vids = await axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&type=video&maxResults=3&key=${API_KEY}`);
        console.log("Latest videos:");
        vids.data.items.forEach(v => {
            console.log(`- ${v.snippet.title} (https://www.youtube.com/watch?v=${v.id.videoId})`);
        });
    } catch (e) {
        console.error(e.response ? e.response.data : e.message);
    }
}
testYT();
