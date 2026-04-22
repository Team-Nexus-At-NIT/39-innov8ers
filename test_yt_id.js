const fs = require('fs');

async function testYT() {
    try {
        const API_KEY = 'AIzaSyDiYXQn7JkitSBVpaHOiemqwrHW8OupPPI';
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=DD%20Kisan&type=channel&key=${API_KEY}`);
        const data = await res.json();
        const channelId = data.items[0].id.channelId;
        fs.writeFileSync('yt_channel.txt', channelId, 'utf8');

        // Test fetch latest videos to ensure it works
        const vidsRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&type=video&maxResults=3&key=${API_KEY}`);
        const vidsData = await vidsRes.json();
        fs.writeFileSync('yt_videos.json', JSON.stringify(vidsData.items, null, 2), 'utf8');
        console.log("SUCCESS");
    } catch (e) {
        console.error(e);
    }
}
testYT();
