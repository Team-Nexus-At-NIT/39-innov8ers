import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { ArrowUp, ArrowDown, TrendingUp, RefreshCw } from 'lucide-react';

const PriceTicker = () => {
    // Mock APMC Data - In production, replace this with a fetch to data.gov.in API
    // API Endpoint Example: https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=YOUR_KEY&format=json
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                // Fetch from our backend which now uses the Official API
                const { data } = await api.get('/market');
                if (data.success && data.data.length > 0) {
                    // Take only first 20 items for ticker to keep it lightweight
                    const tickerData = data.data.slice(0, 20).map(item => ({
                        id: item.id,
                        commodity: item.crop,
                        market: item.market.split(',')[0], // Just market name
                        price: item.price,
                        unit: item.unit,
                        change: Math.floor(Math.random() * 50) - 25, // Simulate change since API doesn't have it
                        isUp: Math.random() > 0.5
                    }));
                    setPrices(tickerData);
                }
            } catch (error) {
                console.error("Failed to fetch ticker data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPrices();
        // Refresh every 5 minutes
        const interval = setInterval(fetchPrices, 300000);
        return () => clearInterval(interval);
    }, []);

    if (loading || prices.length === 0) return null; // Don't show if no data

    return (
        <div className="bg-gray-900 border-b border-gray-800 text-white overflow-hidden relative h-10 flex items-center shadow-inner z-50">
            {/* Live Indicator */}
            <div className="absolute left-0 top-0 bottom-0 bg-red-600 px-3 flex items-center space-x-2 z-10 shadow-lg md:px-4">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider hidden md:block">APMC Live</span>
                <span className="text-xs font-bold uppercase tracking-wider md:hidden">Live</span>
            </div>

            {/* Ticker Content */}
            <div className="flex-1 overflow-hidden relative ml-20 md:ml-32">
                <div className="animate-ticker flex items-center space-x-8 whitespace-nowrap">
                    {/* Duplicate array for seamless loop */}
                    {[...prices, ...prices, ...prices].map((item, index) => (
                        <div key={`${item.id}-${index}`} className="flex items-center space-x-2 text-sm font-medium">
                            <span className="text-gray-400 text-xs uppercase">{item.market}</span>
                            <span className="font-bold text-gray-100">{item.commodity}</span>
                            <span className="font-mono">₹{item.price}/{item.unit}</span>
                            <div className={`flex items-center text-xs ${item.isUp ? 'text-green-400' : 'text-red-400'}`}>
                                {item.isUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                <span>{Math.abs(item.change)}</span>
                            </div>
                            <span className="text-gray-700 mx-2">|</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* End Gradient */}
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-900 to-transparent z-10 pointer-events-none"></div>

            <style jsx>{`
                @keyframes ticker {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-ticker {
                    animation: ticker 40s linear infinite;
                }
                .animate-ticker:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
};

export default PriceTicker;
