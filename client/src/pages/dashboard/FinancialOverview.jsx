import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import {
    IndianRupee, Lock, Unlock, FileText, ArrowLeft,
    TrendingUp, Landmark, ShieldCheck, Clock, Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

/** Compact Indian number formatter */
const fmt = (n) => {
    if (!n || n === 0) return '₹0';
    if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`;
    if (n >= 1_00_000)    return `₹${(n / 1_00_000).toFixed(2)} L`;
    if (n >= 1_000)       return `₹${(n / 1_000).toFixed(1)} K`;
    return `₹${n}`;
};

const FinancialOverview = () => {
    const navigate = useNavigate();
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchContracts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/contracts');
            if (res.data.success) setContracts(res.data.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
            toast.error('Failed to load financial data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchContracts(); }, []);

    const totalReleased = contracts.reduce(
        (acc, c) => acc + (c.escrow?.totalReleased || c.fulfillment?.payments?.totalPaid || 0), 0
    );
    const totalPending = contracts.reduce((acc, c) => {
        const total = (c.pricingTerms?.pricePerUnit || 0) * (c.cropDetails?.quantity || 0);
        const paid  = c.escrow?.totalReleased || c.fulfillment?.payments?.totalPaid || 0;
        return acc + Math.max(0, total - paid);
    }, 0);
    const totalPortfolio = contracts.reduce(
        (acc, c) => acc + ((c.pricingTerms?.pricePerUnit || 0) * (c.cropDetails?.quantity || 0)), 0
    );

    const allTransactions = contracts
        .flatMap(c =>
            (c.fulfillment?.payments?.history || []).map(tx => ({
                ...tx,
                cropName:   c.cropDetails?.cropName || c.cropName || 'Contract',
                contractId: c._id,
            }))
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const filtered = allTransactions.filter(tx =>
        !search ||
        tx.cropName?.toLowerCase().includes(search.toLowerCase()) ||
        tx.transactionId?.toLowerCase().includes(search.toLowerCase()) ||
        tx.stage?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="w-10 h-10 border-4 border-green-200 border-t-green-700 rounded-full animate-spin"></div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Ledger...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10">

            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2.5 bg-white border-2 border-gray-200 rounded-xl text-gray-500 hover:text-green-700 hover:border-green-300 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] flex items-center gap-1.5 mb-1">
                            <Landmark className="w-3 h-3" /> Vault & Settlements
                        </p>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Financial Ledger</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border-2 border-emerald-200 px-4 py-2 rounded-xl">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Bank-Grade Escrow</span>
                </div>
            </div>

            {/* ── 3 Analytics Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

                <div className="bg-white border-2 border-emerald-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-5 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Unlock className="w-16 h-16 text-emerald-600" />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Total Settled</p>
                    <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 truncate">{fmt(totalReleased)}</h2>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 border border-emerald-200 w-fit px-3 py-1 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Fully Cleared
                    </div>
                </div>

                <div className="bg-white border-2 border-amber-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-amber-400 transition-all relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-5 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Lock className="w-16 h-16 text-amber-600" />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Escrow Reserved</p>
                    <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 truncate">{fmt(totalPending)}</h2>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-amber-700 uppercase tracking-widest bg-amber-50 border border-amber-200 w-fit px-3 py-1 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        Awaiting Stage
                    </div>
                </div>

                <div className="bg-green-900 border-2 border-green-700 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-5 opacity-10 group-hover:opacity-20 transition-opacity">
                        <FileText className="w-16 h-16 text-white" />
                    </div>
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-3">Asset Portfolio</p>
                    <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 truncate">{fmt(totalPortfolio)}</h2>
                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Locked Yield Value</p>
                </div>
            </div>

            {/* ── Transaction Archive ── */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                {/* Archive Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-5 border-b-2 border-gray-100">
                    <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                        <Landmark className="w-5 h-5 text-amber-500" />
                        Transaction Archive
                    </h2>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search crop, TXN ID..."
                            className="bg-transparent text-xs border-none outline-none font-semibold text-gray-700 w-40 placeholder:text-gray-300"
                        />
                    </div>
                </div>

                {/* Transaction Rows */}
                <div className="p-5 space-y-3 bg-gray-50/50">
                    {filtered.length > 0 ? (
                        filtered.map((tx, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-emerald-200 hover:shadow-sm transition-all group"
                            >
                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                                        <Landmark className="w-5 h-5 text-emerald-700" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                            <span className="text-sm font-black text-gray-900 uppercase tracking-tight">{tx.cropName}</span>
                                            {tx.stage && (
                                                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-widest rounded-lg border border-amber-200">
                                                    {tx.stage}
                                                </span>
                                            )}
                                        </div>
                                        {tx.transactionId && (
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                TXN: {tx.transactionId}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t-2 sm:border-t-0 border-gray-50">
                                    <span className="text-xl font-black text-gray-900">
                                        <span className="text-emerald-500 mr-0.5">+</span>₹{(tx.amount || 0).toLocaleString()}
                                    </span>
                                    {tx.date && (
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold mt-0.5">
                                            <Clock className="w-3 h-3" />
                                            {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white border-2 border-dashed border-gray-200 rounded-2xl">
                            <Landmark className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                            <h3 className="text-gray-400 font-black text-sm uppercase tracking-widest mb-2">
                                {search ? 'No matching transactions' : 'Zero Historical Settlements'}
                            </h3>
                            <p className="text-xs text-gray-300 font-bold uppercase tracking-widest">
                                {search ? 'Try a different search term.' : 'Settled milestone payments will appear here.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinancialOverview;
