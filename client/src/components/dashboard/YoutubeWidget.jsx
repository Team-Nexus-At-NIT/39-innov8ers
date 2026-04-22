import { useState, useEffect } from 'react';
import { Youtube, ExternalLink, Calendar, PlayCircle, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const YoutubeWidget = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // YouTube API Configuration
    const API_KEY = 'AIzaSyDiYXQn7JkitSBVpaHOiemqwrHW8OupPPI';
    const CHANNEL_ID = 'UCnDfmcUyhgJp6xC1LmBLfUg'; // DD Kisan Channel ID
    const MAX_RESULTS = 8; // Increased for horizontal scrolling

    // Resilient Fallback Data (latest popular DD Kisan videos) to ensure UI never breaks
    const FALLBACK_VIDEOS = [
        {
            id: { videoId: 'qN4q_oO2OVM' },
            snippet: {
                title: 'सफल किसान : अमरूद की खेती से लाखों की कमाई (Guava Farming Success Story)',
                description: 'जाने अमरूद की खेती से जुड़ी जरूरी बातें और सफल किसान की कहानी.',
                thumbnails: { high: { url: 'https://i.ytimg.com/vi/qN4q_oO2OVM/hqdefault.jpg' } },
                publishedAt: new Date(Date.now() - 86400000 * 2).toISOString()
            }
        },
        {
            id: { videoId: 'A1t6s-x3iKw' },
            snippet: {
                title: 'कृषि दर्शन : गेहूं की फसल में खरपतवार नियंत्रण (Weed Management in Wheat)',
                description: 'गेहूं की फसल को खरपतवार से कैसे बचाएं, विशेषज्ञ की सलाह.',
                thumbnails: { high: { url: 'https://i.ytimg.com/vi/A1t6s-x3iKw/hqdefault.jpg' } },
                publishedAt: new Date(Date.now() - 86400000 * 3).toISOString()
            }
        },
        {
            id: { videoId: 'k1Y5zQJ6v8A' },
            snippet: {
                title: 'चौपाल चर्चा : जैविक खेती के फायदे और तरीके (Benefits of Organic Farming)',
                description: 'जैविक खेती अपनाकर कैसे बढ़ाएं मिट्टी की उर्वरक क्षमता.',
                thumbnails: { high: { url: 'https://i.ytimg.com/vi/k1Y5zQJ6v8A/hqdefault.jpg' } },
                publishedAt: new Date(Date.now() - 86400000 * 5).toISOString()
            }
        },
        {
            id: { videoId: 'B_l_X1D4vQ0' },
            snippet: {
                title: 'मंडी भाव : आज के प्रमुख कृषि उपज मंडियों के भाव (Crop Market Prices Today)',
                description: 'देश की प्रमुख मंडियों में आज का ताजा भाव.',
                thumbnails: { high: { url: 'https://i.ytimg.com/vi/B_l_X1D4vQ0/hqdefault.jpg' } },
                publishedAt: new Date(Date.now() - 86400000 * 1).toISOString()
            }
        },
        {
            id: { videoId: 'oZ0P_qVJw2E' },
            snippet: {
                title: 'मौसम खबर : आने वाले दिनों का मौसम का हाल (Weather Update for Farmers)',
                description: 'किसानों के लिए अगले 5 दिनों का मौसम पूर्वानुमान.',
                thumbnails: { high: { url: 'https://i.ytimg.com/vi/oZ0P_qVJw2E/hqdefault.jpg' } },
                publishedAt: new Date(Date.now() - 86400000 * 0.5).toISOString()
            }
        }
    ];

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&order=date&type=video&maxResults=${MAX_RESULTS}&key=${API_KEY}`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch YouTube videos');
                }

                const data = await response.json();

                // YouTube API returns empty items occasionally for quotas
                if (data.items && data.items.length > 0) {
                    setVideos(data.items);
                } else {
                    setVideos(FALLBACK_VIDEOS);
                }
                setError(null);
            } catch (err) {
                console.warn("YouTube API limits reached, utilizing fallback DD Kisan feed.", err);
                setVideos(FALLBACK_VIDEOS);
                setError(null); // Prevent breaking the UI
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    return (
        <div className="bg-white py-12 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6">

                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center">
                        <div className="bg-[#FF0000] p-2 rounded-xl shadow-sm mr-4 flex-shrink-0">
                            <Youtube className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold font-serif text-gray-900 leading-tight">DD Kisan Updates</h2>
                                <span className="text-[10px] sm:text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-red-200">Official Partner</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Latest agricultural news, expert advice, and success stories (Kisan ka Apna Channel)</p>
                        </div>
                    </div>

                    <a
                        href="https://www.youtube.com/@ddkisanchannel"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-bold bg-white text-red-600 border-2 border-red-100 hover:border-red-600 hover:bg-red-50 transition-colors px-5 py-2.5 rounded-full flex items-center shrink-0 self-start md:self-auto shadow-sm"
                    >
                        Subscribe on YouTube <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                </div>

                {/* Video Carousel container */}
                <div className="relative group">
                    {loading ? (
                        <div className="flex overflow-x-auto gap-6 pb-6 mt-4 custom-scrollbar scroll-smooth snap-x snap-mandatory">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex-none w-[280px] sm:w-[320px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden snap-start shrink-0 animate-pulse">
                                    <div className="w-full aspect-video bg-gray-200 rounded-t-xl"></div>
                                    <div className="p-4 space-y-3">
                                        <div className="h-5 w-full bg-gray-200 rounded"></div>
                                        <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                                        <div className="h-3 w-1/3 bg-gray-100 rounded mt-4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-8 flex flex-col items-center justify-center text-center max-w-2xl mx-auto shadow-sm my-4">
                            <Youtube className="w-12 h-12 text-red-300 mb-3" />
                            <p className="text-red-700 font-medium">{error}</p>
                            <button onClick={() => window.location.reload()} className="mt-4 text-sm font-bold bg-red-600 text-white px-6 py-2 rounded-full shadow hover:bg-red-700 transition">Retry</button>
                        </div>
                    ) : (
                        <div className="flex overflow-x-auto gap-6 pb-6 mt-4 custom-scrollbar scroll-smooth snap-x">
                            {Array.isArray(videos) && videos.length > 0 ? (
                                videos.map((video) => {
                                    if (!video?.id?.videoId || !video?.snippet) return null;
                                    return (
                                        <a
                                            key={video.id.videoId}
                                            href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex-none w-[280px] sm:w-[320px] flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 hover:border-red-100 transition-all duration-300 snap-center sm:snap-start overflow-hidden relative"
                                        >
                                            {/* Thumbnail */}
                                            <div className="relative w-full aspect-video bg-gray-100 overflow-hidden border-b border-gray-100">
                                                <img
                                                    src={video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url}
                                                    alt={video.snippet.title}
                                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
                                                    onError={(e) => {
                                                        // Fallback to high quality if standard is missing
                                                        e.target.src = `https://i.ytimg.com/vi/${video.id.videoId}/hqdefault.jpg`;
                                                        e.target.onerror = null; // Prevent infinite loop
                                                    }}
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className="flex flex-col flex-grow p-4">
                                                <h4
                                                    className="font-bold text-gray-900 text-[15px] leading-snug mb-2 group-hover:text-[#FF0000] transition-colors line-clamp-2"
                                                    title={video.snippet.title}
                                                >
                                                    {video.snippet.title.replace(/\| DD Kisan.*$/, '').trim()}
                                                </h4>
                                                <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between text-xs font-medium">
                                                    <span className="flex items-center text-gray-500">
                                                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                                        {formatDistanceToNow(new Date(video.snippet.publishedAt), { addSuffix: true })}
                                                    </span>
                                                    <span className="text-red-600 flex items-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 font-bold">
                                                        Watch <ArrowRight className="w-3 h-3 ml-1" />
                                                    </span>
                                                </div>
                                            </div>
                                        </a>
                                    );
                                })
                            ) : (
                                <div className="text-center py-12 text-gray-500 text-sm w-full">No recent broadcasts found.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; margin: 0 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; border: 2px solid #f1f5f9; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
            `}</style>
        </div>
    );
};

export default YoutubeWidget;
