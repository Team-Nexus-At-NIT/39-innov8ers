import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { Search, Filter, ExternalLink, ShieldCheck, Landmark, Tractor, ArrowRight } from 'lucide-react';

const Schemes = () => {
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ category: 'All', state: 'All' });
    const [searchTerm, setSearchTerm] = useState('');

    const [syncing, setSyncing] = useState(false);

    const fetchSchemes = async () => {
        try {
            const response = await api.get('/schemes');
            setSchemes(response.data);
        } catch (error) {
            console.error("Failed to fetch schemes", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchemes();
    }, []);

    const handleSync = async () => {
        setSyncing(true);
        try {
            const res = await api.post('/schemes/sync');
            if (res.data.success) {
                setSchemes(res.data.data); // Update with fresh data including Loans
                // Optionally show toast here
            }
        } catch (error) {
            console.error("Sync failed", error);
        } finally {
            setSyncing(false);
        }
    };

    const filteredSchemes = schemes.filter(scheme =>
        (filter.category === 'All' || scheme.category === filter.category) && // Added Category Filter Logic
        (filter.state === 'All' || scheme.state === filter.state || !scheme.state) &&
        (scheme.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            scheme.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const categories = ['All', 'Subsidy', 'Insurance', 'Infrastructure', 'Loan'];
    const states = ['All', 'All India', 'Punjab', 'Haryana', 'Maharashtra']; // Expand as needed

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans">
            {/* 1. Hero / Search Header */}
            <div className="relative pt-24 pb-32 overflow-hidden text-white bg-blue-900">
                {/* Robust absolute background image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://img.freepik.com/free-photo/sunny-meadow-landscape_1112-134.jpg"
                        alt="Agriculture Background"
                        className="w-full h-full object-cover"
                    />
                    {/* Simple dark overlay - No complex blends */}
                    <div className="absolute inset-0 bg-black/50"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold uppercase tracking-widest mb-4 backdrop-blur-md shadow-lg">
                        Government Initiatives
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight drop-shadow-lg leading-tight">
                        Schemes & Subsidies
                    </h1>
                    <p className="text-blue-50 text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-medium drop-shadow-md">
                        Access financial aid, insurance coverage, and infrastructure support designed to empower the agricultural sector.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-3xl mx-auto bg-white p-2 rounded-2xl shadow-2xl flex items-center transform md:scale-105 transition-transform border border-white/20">
                        <div className="pl-4 text-gray-400">
                            <Search className="w-6 h-6" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for schemes, subsidies, or benefits..."
                            className="w-full px-4 py-4 text-lg text-gray-700 placeholder-gray-400 outline-none bg-transparent font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition shadow-blue-500/30 whitespace-nowrap mr-2"
                        >
                            {syncing ? (
                                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                            ) : (
                                <>
                                    <span>Sync Portal</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Main Content */}
            <div className="max-w-7xl mx-auto px-6 -mt-10 pb-20 relative z-20">
                {/* Filters */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 mb-10 flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                        <Filter className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter({ ...filter, category: cat })}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap ${filter.category === cat
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Filter by Region:</span>
                        <select
                            className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 w-full"
                            value={filter.state}
                            onChange={(e) => setFilter({ ...filter, state: e.target.value })}
                        >
                            {states.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading official schemes...</p>
                    </div>
                ) : filteredSchemes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredSchemes.map(scheme => (
                            <div key={scheme._id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
                                <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${scheme.category === 'Subsidy' ? 'bg-green-50 text-green-600' :
                                            scheme.category === 'Insurance' ? 'bg-amber-50 text-amber-600' :
                                                scheme.category === 'Loan' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                                            }`}>
                                            {scheme.category === 'Subsidy' ? <Tractor className="w-6 h-6" /> :
                                                scheme.category === 'Insurance' ? <ShieldCheck className="w-6 h-6" /> :
                                                    scheme.category === 'Loan' ? <Landmark className="w-6 h-6" /> : <Landmark className="w-6 h-6" />}
                                        </div>
                                        <span className="px-3 py-1 rounded-full bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-wider border border-gray-100">
                                            {scheme.state || 'Central'}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition leading-snug">
                                        {scheme.title}
                                    </h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-4">
                                        {scheme.provider || scheme.organization}
                                    </p>

                                    <div className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                                        {scheme.description}
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Key Benefits</p>
                                        <ul className="space-y-2">
                                            {scheme.benefits.slice(0, 2).map((b, i) => (
                                                <li key={i} className="flex items-start text-sm font-medium text-gray-700">
                                                    <span className="mr-2 text-green-500">✓</span> {b}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <a
                                        href={scheme.applicationLink || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-auto w-full py-3 rounded-xl border border-blue-100 text-blue-600 font-bold text-sm bg-blue-50 hover:bg-blue-600 hover:text-white transition flex items-center justify-center group-hover:shadow-md"
                                    >
                                        View Details <ExternalLink className="ml-2 w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Search className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No schemes found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters.</p>
                        <button onClick={() => { setSearchTerm(''); setFilter({ category: 'All', state: 'All' }); }} className="mt-4 text-blue-600 font-bold hover:underline">
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Schemes;
