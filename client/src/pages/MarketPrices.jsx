import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../lib/axios';
import { ArrowUp, ArrowDown, Minus, Search, Filter, MapPin, RefreshCw } from 'lucide-react';

const MarketPrices = () => {
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMarket, setFilterMarket] = useState('All');

    useEffect(() => {
        fetchPrices();
    }, []);

    const fetchPrices = async () => {
        try {
            setLoading(true);
            const res = await api.get('/market');
            if (res.data.success) {
                setPrices(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching market prices:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPrices = prices.filter(item => {
        const matchesSearch = item.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.market.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterMarket === 'All' || item.market.includes(filterMarket);
        return matchesSearch && matchesFilter;
    });

    const markets = ['All', ...new Set(prices.map(item => item.market.split(',')[0].trim()))];

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Live Mandi Prices</h1>
                        <p className="mt-2 text-gray-600">Real-time market rates from APMCs across India</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                            Live Updates
                        </span>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out sm:text-sm"
                                placeholder="Search crops or markets..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex-shrink-0">
                            <select
                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-lg"
                                value={filterMarket}
                                onChange={(e) => setFilterMarket(e.target.value)}
                            >
                                {markets.map((market, index) => (
                                    <option key={index} value={market}>{market}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={fetchPrices}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Data Grid */}
                {loading ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div>
                        <p className="mt-4 text-gray-500">Loading market data...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPrices.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 overflow-hidden">
                                <div className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{item.crop}</h3>
                                            <p className="text-sm text-gray-500">{item.variety}</p>
                                        </div>
                                        <div className={`flex items-center px-2 py-1 rounded-md text-xs font-semibold ${item.trend === 'up' ? 'bg-green-100 text-green-800' :
                                            item.trend === 'down' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {item.trend === 'up' && <ArrowUp className="h-3 w-3 mr-1" />}
                                            {item.trend === 'down' && <ArrowDown className="h-3 w-3 mr-1" />}
                                            {item.trend === 'stable' && <Minus className="h-3 w-3 mr-1" />}
                                            {item.change}
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-baseline">
                                        <span className="text-3xl font-extrabold text-gray-900">₹{item.price}</span>
                                        <span className="ml-1 text-gray-500">/{item.unit}</span>
                                    </div>

                                    <div className="mt-4 flex items-center text-sm text-gray-500">
                                        <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                        {item.market}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
                                        <span>Update: {item.lastUpdated}</span>
                                        <span>ID: #{item.id}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredPrices.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <p className="text-gray-500">No market data found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketPrices;
