import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ContractCard from '../../components/dashboard/ContractCard';
import DemandCard from '../../components/dashboard/DemandCard';
import CreateDemandForm from '../../components/dashboard/CreateDemandForm';
import { Plus, BarChart3, Package, FileText, CheckCircle, Building2, Layers } from 'lucide-react';

const BuyerDashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [contracts, setContracts]       = useState([]);
    const [demands, setDemands]           = useState([]);
    const [loading, setLoading]           = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [activeTab, setActiveTab]       = useState('contracts');

    const fetchData = async () => {
        setLoading(true);
        try {
            const contractsRes = await api.get('/contracts');
            if (contractsRes.data.success) setContracts(contractsRes.data.data);

            const demandsRes = await api.get('/demands/my');
            if (demandsRes.data.success) setDemands(demandsRes.data.data);
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
        socket.on('contract_proposed', (c) => { toast.success(`New application received for ${c.cropName}!`); fetchData(); });
        socket.on('new_bid', () => { toast.success('New application received!'); fetchData(); });
        return () => { socket.disconnect(); };
    }, [user]);

    const openDemandsCount      = demands.filter(d => d.status === 'Open').length;
    const activeContractsCount  = contracts.filter(c => c.status === 'Active').length;

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 pb-10 px-0">

            {showCreateForm && (
                <CreateDemandForm
                    onClose={() => setShowCreateForm(false)}
                    onSuccess={() => { setShowCreateForm(false); fetchData(); }}
                />
            )}

            {/* ── Corporate Header Banner ─────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-green-800 bg-gradient-to-br from-slate-900 via-green-900 to-emerald-800 shadow-xl px-5 sm:px-8 py-8 sm:py-10">
                <div className="absolute top-0 right-0 w-64 h-64 opacity-5" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>
                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <Building2 className="w-4 h-4 text-green-300 flex-shrink-0" />
                            <span className="text-green-300 text-[11px] font-bold uppercase tracking-widest truncate">Kisan Bandhu — Buyer Portal</span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2 break-words">
                            Welcome, <span className="text-amber-300">{user?.name || 'Buyer'}</span>
                        </h1>
                        <p className="text-green-100/80 text-sm max-w-md hidden sm:block">
                            Manage commodity demands, review farmer applications, and maintain your supply chain.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="flex-shrink-0 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-900 font-black text-sm rounded-xl border-2 border-amber-500 flex items-center gap-2 transition-all w-full sm:w-auto justify-center"
                    >
                        <Plus className="h-4 w-4" /> Post New Demand
                    </button>
                </div>
            </div>

            {/* ── Procurement Metrics ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                <div className="bg-white rounded-2xl border-2 border-amber-200 shadow-sm hover:shadow-md hover:border-amber-400 transition-all p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{t('Open Demands')}</p>
                        <h3 className="text-3xl font-black text-gray-900 leading-none">{openDemandsCount}</h3>
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">Postings awaiting bids</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border-2 border-green-200 shadow-sm hover:shadow-md hover:border-green-400 transition-all p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-50 border-2 border-green-200 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-green-700" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{t('Active Contracts')}</p>
                        <h3 className="text-3xl font-black text-gray-900 leading-none">{activeContractsCount}</h3>
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">Ongoing field contracts</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border-2 border-emerald-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Platform Status</p>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                            </span>
                            <h3 className="text-lg font-black text-green-700">Online</h3>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium">Real-time sync active</p>
                    </div>
                </div>
            </div>

            {/* ── Tab Nav + Content ────────────────────────────────────────── */}
            <div className="rounded-2xl overflow-hidden border-2 border-green-200 shadow-sm">

                {/* Tab strip */}
                <div className="bg-white border-b-2 border-gray-100 px-4 sm:px-6 pt-3 flex overflow-x-auto gap-1 scrollbar-none">
                    {[
                        { key: 'contracts', label: t('Active Contracts'), icon: FileText,  count: contracts.length },
                        { key: 'demands',   label: t('My Postings'),      icon: Layers,    count: demands.length   },
                    ].map(({ key, label, icon: Icon, count }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
                                activeTab === key
                                    ? 'border-green-700 text-green-800 bg-green-50'
                                    : 'border-transparent text-gray-500 hover:text-green-800 hover:bg-gray-50'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === key ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                {count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="bg-gray-50/70 p-4 sm:p-6">
                    {loading ? (
                        <div className="text-center py-16">
                            <div className="w-10 h-10 border-4 border-green-200 border-t-green-700 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Loading records...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'contracts' && (
                                contracts.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                                        {contracts.map(c => <ContractCard key={c._id} contract={c} role="buyer" />)}
                                    </div>
                                ) : (
                                    <div className="py-14 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                                        <div className="w-14 h-14 bg-green-50 rounded-2xl border-2 border-green-100 mx-auto mb-4 flex items-center justify-center">
                                            <FileText className="h-7 w-7 text-green-300" />
                                        </div>
                                        <h3 className="text-lg font-black text-gray-700 mb-2">No Active Contracts</h3>
                                        <p className="text-gray-400 text-sm max-w-sm mx-auto px-4">
                                            Accept bids on your demand postings to create formal agreements.
                                        </p>
                                    </div>
                                )
                            )}

                            {activeTab === 'demands' && (
                                demands.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                                        {demands.map(d => <DemandCard key={d._id} demand={d} onUpdate={fetchData} />)}
                                    </div>
                                ) : (
                                    <div className="py-14 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                                        <div className="w-14 h-14 bg-amber-50 rounded-2xl border-2 border-amber-100 mx-auto mb-4 flex items-center justify-center">
                                            <Package className="h-7 w-7 text-amber-300" />
                                        </div>
                                        <h3 className="text-lg font-black text-gray-700 mb-2">No Demand Postings</h3>
                                        <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto px-4">
                                            Haven't posted any commodity demands yet.
                                        </p>
                                        <button
                                            onClick={() => setShowCreateForm(true)}
                                            className="px-6 py-2.5 bg-green-800 hover:bg-green-700 text-white font-bold text-sm rounded-xl transition-colors border-2 border-green-700"
                                        >
                                            Create First Posting
                                        </button>
                                    </div>
                                )
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BuyerDashboard;
