const Parser = require('rss-parser');
const parser = new Parser();

// @desc    Get Real-Time Agriculture News
// @route   GET /api/news
// @access  Public
exports.getAgriNews = async (req, res) => {
    try {
        // List of reliable Agri-News RSS Feeds
        const FEED_URLS = [
            'https://www.thehindubusinessline.com/economy/agri-business/feeder/default.rss',
            'https://krishijagran.com/feeds/rss/news',
            // 'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms' // TOI Agriculture if available, often general business
        ];

        // Fetch from 1st available source (fallback to next if fails)
        let feed = null;
        for (const url of FEED_URLS) {
            try {
                feed = await parser.parseURL(url);
                if (feed && feed.items.length > 0) break;
            } catch (e) {
                console.log(`Failed to fetch news from ${url}:`, e.message);
                continue;
            }
        }

        if (!feed) {
            return res.status(503).json({ success: false, error: 'News service temporarily unavailable' });
        }

        // Format items for frontend
        const newsItems = feed.items.slice(0, 10).map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            content: item.contentSnippet || item.content,
            source: feed.title || 'Agri News'
        }));

        res.status(200).json({
            success: true,
            data: newsItems,
            fetchedAt: new Date()
        });

    } catch (error) {
        console.error("News Fetch Error:", error);
        res.status(500).json({ success: false, error: 'Server Error fetching news' });
    }
};
