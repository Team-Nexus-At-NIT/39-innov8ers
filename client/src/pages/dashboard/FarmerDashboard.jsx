import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import DashboardContractCard from '../../components/dashboard/DashboardContractCard';
import {
    CloudRain, TrendingUp, ShoppingBag, ArrowUpRight, Plus, Search,
    FileText, Leaf, Wheat, IndianRupee, Lock, Unlock, Landmark, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/** Compact Indian number formatter: 1,23,45,678 → ₹1.23 Cr */
const fmt = (n) => {
    if (!n || n === 0) return '₹0';
    if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`;
    if (n >= 1_00_000)    return `₹${(n / 1_00_000).toFixed(2)} L`;
    if (n >= 1_000)       return `₹${(n / 1_000).toFixed(1)} K`;
    return `₹${n}`;
};

const FarmerDashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [contracts, setContracts] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const contractsRes = await api.get('/contracts');
            if (contractsRes.data.success) setContracts(contractsRes.data.data);

            const recsRes = await api.get('/demands/recommend');
            if (recsRes.data.success) setRecommendations(recsRes.data.data);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        if (!user) return;
        const socket = io();
        socket.emit('join', user._id);
        socket.on('contract_updated', (c) => { toast.success(`Contract updated: ${c.status}`); fetchData(); });
        socket.on('contract_proposed', () => { toast.success('New contract proposal received!'); fetchData(); });
        return () => { socket.disconnect(); };
    }, [user]);

    // ── Derived Financial Data ───────────────────────────────────────────────
    const activeContractsCount = contracts.filter(c => c.status === 'Active').length;

    const totalContractValue = contracts.reduce(
        (acc, c) => acc + ((c.pricingTerms?.pricePerUnit || 0) * (c.cropDetails?.quantity || 0)), 0
    );
    const totalReleased = contracts.reduce(
        (acc, c) => acc + (c.escrow?.totalReleased || c.fulfillment?.payments?.totalPaid || 0), 0
    );
    const totalPending = contracts.reduce((acc, c) => {
        const total = (c.pricingTerms?.pricePerUnit || 0) * (c.cropDetails?.quantity || 0);
        const paid  = c.escrow?.totalReleased || c.fulfillment?.payments?.totalPaid || 0;
        return acc + Math.max(0, total - paid);
    }, 0);

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 pb-10 px-0">

            {/* ── Hero Banner ─────────────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-green-800 bg-gradient-to-br from-green-900 via-green-800 to-emerald-700 shadow-xl px-5 sm:px-8 py-8 sm:py-10">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}></div>
                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <Leaf className="w-4 h-4 text-green-300 flex-shrink-0" />
                            <span className="text-green-300 text-[11px] font-bold uppercase tracking-widest truncate">Kisan Bandhu — Farmer Portal</span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2 break-words">
                            Namaste, <span className="text-amber-300">{user?.name || 'Farmer'}</span> 🌾
                        </h1>
                        <p className="text-green-100/80 text-sm max-w-md hidden sm:block">
                            Manage your contracts, explore market opportunities, and grow your agricultural income.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/marketplace')}
                        className="flex-shrink-0 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-900 font-black text-sm rounded-xl border-2 border-amber-500 flex items-center gap-2 transition-all w-full sm:w-auto justify-center"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        Marketplace
                    </button>
                </div>
            </div>

            {/* ── Overview Stats ──────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                <div className="bg-white rounded-2xl border-2 border-green-200 shadow-sm hover:shadow-md hover:border-green-400 transition-all p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-50 border-2 border-green-200 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-green-700" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Active Contracts</p>
                        <h3 className="text-3xl font-black text-gray-900 leading-none">{activeContractsCount}</h3>
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5 truncate">Signed & in progress</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center flex-shrink-0">
                        <CloudRain className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Weather Risk</p>
                        <h3 className="text-xl font-black text-green-700 leading-none">Low Risk</h3>
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5 truncate">Favorable forecasted</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border-2 border-amber-200 shadow-sm hover:shadow-md hover:border-amber-400 transition-all p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Est. Revenue</p>
                        <h3 className="text-3xl font-black text-gray-900 leading-none">₹4.2L</h3>
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5 truncate">Based on contracts</p>
                    </div>
                </div>
            </div>

            {/* ── Financial Summary Widget ─────────────────────────────────── */}
            <div className="rounded-2xl border-2 border-emerald-200 overflow-hidden shadow-sm">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-800 to-green-800 px-5 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                            <Landmark className="w-5 h-5 text-amber-300" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-white tracking-tight">Financial Ledger</h2>
                            <p className="text-emerald-200 text-[11px] font-medium">Escrow vault & payment settlements</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/financials')}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all w-full sm:w-auto justify-center"
                    >
                        View Full Ledger <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* 3-stat strip — stacks on mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-emerald-100 bg-emerald-50">
                    {[
                        { icon: Unlock, color: 'emerald', label: 'Total Settled',   value: fmt(totalReleased)      },
                        { icon: Lock,   color: 'amber',   label: 'Escrow Reserved', value: fmt(totalPending)       },
                        { icon: IndianRupee, color: 'green', label: 'Total Portfolio', value: fmt(totalContractValue) },
                    ].map(({ icon: Icon, color, label, value }) => (
                        <div key={label} className="p-4 sm:p-5 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-white border-2 border-${color}-200 flex items-center justify-center flex-shrink-0`}>
                                <Icon className={`w-5 h-5 text-${color}-600`} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
                                <p className="text-lg font-black text-gray-900 truncate">{value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── AI Smart Match ───────────────────────────────────────────── */}
            {recommendations.length > 0 && (
                <div className="rounded-2xl overflow-hidden border-2 border-slate-700 shadow-md">
                    <div className="bg-gradient-to-r from-slate-900 to-green-900 px-5 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="w-5 h-5 text-amber-300" />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-white tracking-tight">Smart Match — AI Recommendations</h2>
                                <p className="text-slate-300 text-[11px] font-medium hidden sm:block">Personalised buyer demands matching your crop profile</p>
                            </div>
                        </div>
                        <span className="text-[10px] bg-amber-400 text-amber-900 px-3 py-1 rounded-full font-black uppercase tracking-wider border border-amber-500 flex-shrink-0">AI Powered</span>
                    </div>

                    <div className="bg-white p-4 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recommendations.map(demand => (
                                <div key={demand._id} className="bg-white border-2 border-green-200 rounded-xl p-4 hover:border-green-500 hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start gap-2 mb-3">
                                        <span className="px-2.5 py-1 bg-green-100 text-green-800 text-[10px] font-black rounded-lg uppercase tracking-wider border border-green-200 truncate max-w-[120px]">
                                            {demand.cropName}
                                        </span>
                                        <span className="text-green-800 font-black text-sm flex-shrink-0">₹{demand.pricePerTon?.toLocaleString()}/t</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1 text-sm truncate group-hover:text-green-800 transition-colors">{demand.buyer?.name || 'Bulk Buyer'}</h3>
                                    <p className="text-xs text-gray-500 mb-4 truncate">
                                        {demand.cropDetails?.variety || 'Quality Produce'} • {demand.quantityRequired} T req.
                                    </p>
                                    <button
                                        onClick={() => navigate('/dashboard/marketplace', { state: { openDemandId: demand._id } })}
                                        className="w-full py-2.5 bg-green-800 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-green-700"
                                    >
                                        View Opportunity <ArrowUpRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── My Contracts ─────────────────────────────────────────────── */}
            <div className="rounded-2xl overflow-hidden border-2 border-green-300 shadow-sm">
                <div className="bg-green-800 px-5 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Wheat className="w-5 h-5 text-amber-300 flex-shrink-0" />
                        <h2 className="text-base font-black text-white tracking-tight">{t('My Contracts')}</h2>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/marketplace')}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all w-full sm:w-auto justify-center"
                    >
                        <Plus className="w-4 h-4" /> Find New Contracts
                    </button>
                </div>

                <div className="bg-gray-50 p-4 sm:p-6">
                    {loading ? (
                        <div className="text-center py-16">
                            <div className="w-10 h-10 border-4 border-green-200 border-t-green-700 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Fetching contracts...</p>
                        </div>
                    ) : contracts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                            {contracts.map(contract => (
                                <DashboardContractCard key={contract._id} contract={contract} role="farmer" />
                            ))}
                        </div>
                    ) : (
                        <div className="py-14 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                            <div className="w-14 h-14 bg-green-50 rounded-2xl border-2 border-green-100 mx-auto mb-4 flex items-center justify-center">
                                <Search className="h-7 w-7 text-green-300" />
                            </div>
                            <h3 className="text-lg font-black text-gray-700 mb-2">No Contracts Yet</h3>
                            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto px-4">
                                No active contracts found. Explore the marketplace to find buyers.
                            </p>
                            <button
                                onClick={() => navigate('/dashboard/marketplace')}
                                className="px-6 py-2.5 bg-green-800 hover:bg-green-700 text-white font-bold text-sm rounded-xl transition-colors border-2 border-green-700"
                            >
                                Browse Marketplace
                            </button>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default FarmerDashboard;
