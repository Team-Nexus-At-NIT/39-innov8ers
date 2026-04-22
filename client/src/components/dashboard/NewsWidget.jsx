import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Newspaper, ExternalLink, Loader2, RefreshCw } from 'lucide-react';

const NewsWidget = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNews = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/news');
            if (data.success) {
                setNews(data.data);
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            console.error("News Load Failed", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    return (
        <div className="h-full flex flex-col bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden group/widget">
            {/* Header - Harvest Theme */}
            <div className="relative h-28 flex flex-col justify-between overflow-hidden sticky top-0 z-20">
                {/* Background Image */}
                <img 
                    src="/market-bg.jpg" 
                    alt="Harvest" 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/widget:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 to-green-800/60 backdrop-blur-[2px]" />

                <div className="relative z-10 p-5 flex justify-between items-center h-full">
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-white/20 rounded-xl shadow-lg border border-white/20 backdrop-blur-md">
                            <Newspaper className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-black text-xl text-white tracking-tight uppercase">Agri-News</h3>
                            <p className="text-[10px] font-bold text-emerald-100/80 uppercase tracking-[0.2em] mt-0.5">Live Updates</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchNews}
                        className="p-2.5 text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all backdrop-blur-md shadow-lg"
                        title="Refresh News"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative bg-gray-50/50">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10 backdrop-blur-[2px]">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                            <p className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.2em]">Harvesting updates...</p>
                        </div>
                    </div>
                )}

                {!loading && error && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
                        <div className="p-4 bg-red-50 rounded-full">
                            <RefreshCw className="w-8 h-8 text-red-400 opacity-50" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-4 uppercase tracking-wider">Connection Lost</p>
                            <button onClick={fetchNews} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">Retry Live Link</button>
                        </div>
                    </div>
                )}

                {!loading && !error && (
                    <div className="space-y-4">
                        {news.map((item, index) => (
                            <a
                                key={index}
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative block p-5 bg-white rounded-2xl border border-gray-100 hover:border-emerald-300 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group overflow-hidden"
                            >
                                {/* Active Indicator Dot */}
                                <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />

                                <div className="flex justify-between items-start gap-4">
                                    <h4 className="text-[14px] font-black text-gray-900 leading-snug group-hover:text-emerald-800 line-clamp-3 transition-colors uppercase tracking-tight">
                                        {item.title}
                                    </h4>
                                </div>
                                
                                <div className="flex items-center justify-between mt-6">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-emerald-50 rounded-lg group-hover:bg-emerald-600 transition-colors">
                                            <Newspaper className="w-3.5 h-3.5 text-emerald-600 group-hover:text-white" />
                                        </div>
                                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-50/50 px-2.5 py-1 rounded-md border border-emerald-100/50">
                                            {item.source?.split('.')[0] || 'Agri-Feed'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                            {new Date(item.pubDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                        </span>
                                        <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest mt-0.5">
                                            {new Date(item.pubDate).getFullYear()}
                                        </span>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer with Live Status Ping */}
            <div className="py-3.5 px-6 bg-white border-t border-gray-200 flex justify-center items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)] z-10">
                <div className="flex items-center gap-2 bg-[#F0FDF4] px-4 py-1.5 rounded-full border border-[#DCFCE7] shadow-sm">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]"></span>
                    </span>
                    <span className="text-[10px] text-[#16A34A] uppercase tracking-widest font-extrabold items-center flex">Live Data Feed</span>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; border: 2px solid transparent; background-clip: padding-box; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #94a3b8; }
            `}</style>
        </div>
    );
};

export default NewsWidget;
