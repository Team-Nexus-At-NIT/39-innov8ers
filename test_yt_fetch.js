const API_KEY = 'AIzaSyDiYXQn7JkitSBVpaHOiemqwrHW8OupPPI';

async function testYT() {
  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=DD%20Kisan&type=channel&key=${API_KEY}`);
    const data = await res.json();
    console.log("Channel ID:", data.items[0].id.channelId);
    const channelId = data.items[0].id.channelId;

    const vidsRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&type=video&maxResults=3&key=${API_KEY}`);
    const vidsData = await vidsRes.json();
    console.log("Latest videos:");
    vidsData.items.forEach(v => {
      console.log(`- ${v.snippet.title} (https://www.youtube.com/watch?v=${v.id.videoId})`);
    });
  } catch(e) {
    console.error(e);
  }
}
testYT();
