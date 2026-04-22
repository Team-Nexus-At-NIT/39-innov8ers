import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    ShieldCheck, UserCheck, XCircle, Eye, LogOut, 
    LayoutDashboard, Users, FileText, AlertCircle, 
    CheckCircle2, Clock, Search, Filter, MessageSquare, 
    CornerDownRight, CheckSquare, Gavel
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminData = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('verification');
    const [data, setData] = useState({ users: [], farmers: [], buyers: [] });
    const [contracts, setContracts] = useState([]);
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [resolutionText, setResolutionText] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [adminRes, contractsRes, disputesRes] = await Promise.all([
                api.get('/admin/data'),
                api.get('/contracts'),
                api.get('/disputes')
            ]);

            if (adminRes.data.success) setData(adminRes.data.data);
            if (contractsRes.data.success) setContracts(contractsRes.data.data);
            if (disputesRes.data.success) setDisputes(disputesRes.data.data);
        } catch (error) {
            toast.error("Failed to fetch admin data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleVerify = async (id, name) => {
        if (!window.confirm(`Are you sure you want to verify ${name}?`)) return;
        try {
            await api.put(`/admin/verify/${id}`);
            toast.success(`${name} verified successfully.`);
            fetchData();
        } catch (error) {
            toast.error('Verification failed');
        }
    };

    const handleReject = async (id, name) => {
        if (!window.confirm(`Are you sure you want to block/reject ${name}?`)) return;
        try {
            await api.put(`/admin/reject/${id}`);
            toast.success(`User ${name} blocked.`);
            fetchData();
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const handleResolveDispute = async () => {
        if (!resolutionText) return toast.error('Please provide a resolution note');
        try {
            await api.put(`/disputes/${selectedDispute._id}`, {
                status: 'Resolved',
                resolution: resolutionText
            });
            toast.success('Disputed resolved successfully');
            setSelectedDispute(null);
            setResolutionText('');
            fetchData();
        } catch (error) {
            toast.error('Failed to resolve dispute');
        }
    };

    const viewProfile = (user) => {
        let profile = null;
        if (user.role === 'farmer') {
            profile = data.farmers.find(f => f.user?._id === user._id || f.user === user._id);
        } else if (user.role === 'buyer') {
            profile = data.buyers.find(b => b.user?._id === user._id || b.user === user._id);
        }

        if (profile) {
            setSelectedProfile({ ...profile, role: user.role, userName: user.name });
        } else {
            toast.error('Detailed profile not found.');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Establishing Admin Secure Link...</p>
        </div>
    );

    const verificationList = data.users.filter(u => u.role !== 'admin');

    return (
        <div className="min-h-screen bg-[#f8fafc] flex">
            {/* Sidebar Navigation */}
            <aside className="w-72 bg-slate-900 text-white flex flex-col fixed inset-y-0 shadow-2xl z-50">
                <div className="p-8 border-b border-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-emerald-500 rounded-xl">
                        <ShieldCheck className="w-6 h-6 text-slate-900" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight uppercase">Control Center</h1>
                        <p className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Kisan Bandhu Admin</p>
                    </div>
                </div>

                <nav className="p-4 flex-1 space-y-2 mt-4">
                    <TabButton active={activeTab === 'verification'} icon={Users} label="Identity Verification" onClick={() => setActiveTab('verification')} />
                    <TabButton active={activeTab === 'monitor'} icon={LayoutDashboard} label="Contract Monitor" onClick={() => setActiveTab('monitor')} />
                    <TabButton active={activeTab === 'disputes'} icon={Gavel} label="Issue Resolution" onClick={() => setActiveTab('disputes')} />
                </nav>

                <div className="p-6 border-t border-slate-800 space-y-4">
                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase">System Status</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">v2.4.0 • PRODUCTION</p>
                    </div>
                    <button
                        onClick={() => { logout(); navigate('/'); }}
                        className="w-full flex items-center justify-center gap-3 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-black text-xs uppercase tracking-widest transition-all border border-red-500/20"
                    >
                        <LogOut className="w-4 h-4" />
                        Log Out Portal
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-72 p-10 min-h-screen">
                <header className="flex justify-between items-end mb-10 border-b border-slate-200 pb-8">
                    <div>
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Administrative Hub</h2>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
                            {activeTab === 'verification' && "User Verifications"}
                            {activeTab === 'monitor' && "Contract Monitoring"}
                            {activeTab === 'disputes' && "Dispute Management"}
                        </h3>
                    </div>

                    <div className="flex gap-4">
                        <StatCard label="Live Contracts" value={contracts.length} color="blue" />
                        <StatCard label="Open Issues" value={disputes.filter(d => d.status === 'Open').length} color="red" />
                    </div>
                </header>

                {/* Tab Content */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'verification' && (
                        <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Profile</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Protocol</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {verificationList.map((item) => (
                                            <tr key={item._id} className="hover:bg-slate-50/80 transition-all group">
                                                <td className="px-8 py-6">
                                                    <div className="font-black text-slate-900 text-base group-hover:text-emerald-700 transition-colors uppercase tracking-tight italic">{item.name}</div>
                                                    <div className="text-[11px] font-bold text-slate-400">{item.email}</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                                        item.role === 'farmer' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                                                    }`}>
                                                        {item.role}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    {item.isVerified ? (
                                                        <span className="inline-flex items-center text-[10px] font-black bg-emerald-50 text-emerald-700 rounded-full px-4 py-1.5 border border-emerald-200 shadow-sm uppercase tracking-widest">
                                                            <UserCheck className="w-3.5 h-3.5 mr-2" /> Verified
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center text-[10px] font-black bg-amber-50 text-amber-700 rounded-full px-4 py-1.5 border border-amber-200 shadow-sm uppercase tracking-widest">
                                                            <Clock className="w-3.5 h-3.5 mr-2 animate-spin-slow" /> Pending
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex justify-center gap-3">
                                                        <button onClick={() => viewProfile(item)} className="p-2.5 bg-slate-50 text-slate-500 hover:bg-slate-900 hover:text-white rounded-xl border border-slate-200 transition-all shadow-sm">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        {!item.isVerified && (
                                                            <button onClick={() => handleVerify(item._id, item.name)} className="px-5 py-2.5 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all">
                                                                Authorize
                                                            </button>
                                                        )}
                                                        <button onClick={() => handleReject(item._id, item.name)} className="p-2.5 bg-red-50 text-red-400 hover:bg-red-600 hover:text-white rounded-xl border border-red-100 transition-all">
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'monitor' && (
                        <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden">
                             <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Agreement ID</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Farmer & Buyer</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Value & Crop</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Safety Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {contracts.map((contract) => (
                                            <tr key={contract._id} className="hover:bg-slate-50/80 transition-all">
                                                <td className="px-8 py-6">
                                                    <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded">#{contract._id?.slice(-8).toUpperCase()}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-black text-slate-900 text-sm uppercase italic">{contract.farmer?.name || 'Loading...'}</span>
                                                        <ArrowRight className="w-3 h-3 text-slate-300" />
                                                        <span className="font-bold text-slate-500 text-xs uppercase">{contract.buyer?.name || 'Loading...'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="font-black text-slate-900 text-sm uppercase italic">{contract.cropDetails?.cropName || contract.cropName}</div>
                                                    <div className="text-[10px] font-black text-emerald-600">₹{(contract.pricingTerms?.pricePerUnit || contract.pricePerTon || 0).toLocaleString()}/Unit</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`inline-flex items-center text-[9px] font-black px-3 py-1.5 rounded-full border uppercase tracking-widest ${
                                                        contract.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                                        contract.status === 'Completed' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                                                    }`}>
                                                        {contract.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'disputes' && (
                        <div className="space-y-6">
                            {disputes.length === 0 ? (
                                <div className="bg-white rounded-[32px] p-20 text-center border-2 border-dashed border-slate-200">
                                    <CheckCircle2 className="w-16 h-16 text-emerald-200 mx-auto mb-6" />
                                    <h4 className="text-xl font-black text-slate-900 uppercase italic">All Quiet on the Front</h4>
                                    <p className="text-slate-400 text-sm font-medium mt-2">No active disputes or issues reported on the platform.</p>
                                </div>
                            ) : (
                                disputes.sort((a,b) => a.status === 'Open' ? -1 : 1).map((issue) => (
                                    <div key={issue._id} className="bg-white rounded-[32px] p-8 shadow-xl border border-slate-100 flex gap-8 items-start hover:shadow-2xl transition-all group overflow-hidden relative">
                                        <div className={`absolute top-0 right-0 px-8 py-2 rounded-bl-3xl text-[10px] font-black uppercase tracking-widest border-b border-l ${
                                            issue.status === 'Open' ? 'bg-red-500 text-white border-red-600 animate-pulse' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                        }`}>
                                            {issue.status}
                                        </div>

                                        <div className={`p-5 rounded-[24px] shrink-0 shadow-inner ${issue.status === 'Open' ? 'bg-red-50' : 'bg-emerald-50'}`}>
                                            <AlertCircle className={`w-8 h-8 ${issue.status === 'Open' ? 'text-red-500' : 'text-emerald-500'}`} />
                                        </div>

                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">{issue.reason}</h4>
                                                    <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">ID: {issue._id.slice(-6)}</span>
                                                </div>
                                                <p className="text-slate-500 text-sm leading-relaxed font-bold">{issue.description}</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6 p-5 bg-slate-50 rounded-[20px] border border-slate-100 shadow-inner">
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reported By</label>
                                                    <div className="font-bold text-slate-900 text-sm uppercase">{issue.raisedBy?.name} <span className="text-[10px] text-slate-400">({issue.raisedBy?.role})</span></div>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Contract</label>
                                                    <div className="font-bold text-slate-900 text-sm uppercase tracking-tighter">#{issue.contract?._id?.slice(-8).toUpperCase() || '—'}</div>
                                                </div>
                                            </div>

                                            {issue.status === 'Open' ? (
                                                <div className="pt-4 flex gap-4">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Administrative Resolution Notes..." 
                                                        className="flex-1 px-6 py-4 bg-white border border-slate-200 rounded-[20px] outline-none focus:ring-2 focus:ring-slate-900 font-bold text-xs uppercase"
                                                        onChange={(e) => {
                                                            setSelectedDispute(issue);
                                                            setResolutionText(e.target.value);
                                                        }}
                                                    />
                                                    <button 
                                                        onClick={handleResolveDispute}
                                                        className="px-8 py-4 bg-slate-900 text-white rounded-[20px] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-600 transition-all flex items-center gap-3 active:scale-95"
                                                    >
                                                        <CheckSquare className="w-5 h-5" />
                                                        Resolve Force
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="p-5 bg-emerald-50/50 rounded-[20px] border border-emerald-100">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                        <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Resolution Summary</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-emerald-900 italic">"{issue.resolution}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Verification Modal (Same as before but styled better) */}
            {selectedProfile && (
                <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] shadow-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
                        <div className="px-10 py-8 border-b bg-slate-50/50 flex justify-between items-center relative">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">{selectedProfile.userName}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Institutional Profile Verification</p>
                            </div>
                            <button onClick={() => setSelectedProfile(null)} className="p-3 bg-white text-slate-400 hover:text-red-500 rounded-2xl shadow-sm border border-slate-100 transition-all hover:rotate-90">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-10 overflow-y-auto max-h-[calc(90vh-180px)] space-y-8 custom-scrollbar">
                            {selectedProfile.role === 'farmer' ? (
                                <div className="space-y-10">
                                    <div className="grid grid-cols-2 gap-8">
                                        <AdminDetail label="Aadhaar ID" value={selectedProfile.kyc?.aadhaarNumber} />
                                        <AdminDetail label="PAN Record" value={selectedProfile.kyc?.panNumber} />
                                    </div>
                                    <AdminSection title="Land Asset Details">
                                        <div className="grid grid-cols-2 gap-6">
                                            <AdminDetail label="Area" value={`${selectedProfile.landDetails?.totalLandArea} Acres`} />
                                            <AdminDetail label="Source" value={selectedProfile.landDetails?.irrigationSource} />
                                            <AdminDetail label="Region" value={`${selectedProfile.location?.district}, ${selectedProfile.location?.state}`} />
                                            <AdminDetail label="Primary Crops" value={selectedProfile.cropDetails?.primaryCrops?.join(', ')} />
                                        </div>
                                    </AdminSection>
                                    <AdminSection title="Banking Settlement">
                                        <div className="grid grid-cols-2 gap-6">
                                            <AdminDetail label="Bank" value={selectedProfile.kyc?.bankDetails?.bankName} />
                                            <AdminDetail label="IFSC" value={selectedProfile.kyc?.bankDetails?.ifscCode} />
                                        </div>
                                    </AdminSection>
                                </div>
                            ) : (
                                <div className="space-y-10">
                                     <div className="grid grid-cols-2 gap-8">
                                        <AdminDetail label="Company GST" value={selectedProfile.companyDetails?.gstNumber} />
                                        <AdminDetail label="Director Identification" value={selectedProfile.companyDetails?.cin} />
                                    </div>
                                    <AdminSection title="Authorized Personnel">
                                        <div className="grid grid-cols-2 gap-6">
                                            <AdminDetail label="Official" value={selectedProfile.authPerson?.name} />
                                            <AdminDetail label="Role" value={selectedProfile.authPerson?.designation} />
                                            <AdminDetail label="Phone" value={selectedProfile.authPerson?.phone} />
                                        </div>
                                    </AdminSection>
                                </div>
                            )}
                        </div>

                        <div className="px-10 py-8 border-t bg-slate-50/50 flex justify-end gap-5">
                            <button onClick={() => setSelectedProfile(null)} className="px-8 py-3 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-all">Dismiss</button>
                            <button
                                onClick={() => {
                                    handleVerify(selectedProfile.user?._id || selectedProfile.user, selectedProfile.userName);
                                    setSelectedProfile(null);
                                }}
                                className="px-8 py-4 bg-emerald-600 text-white rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center gap-3"
                            >
                                <CheckSquare className="w-5 h-5" />
                                Approve Institution
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const TabButton = ({ active, icon: Icon, label, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest group ${
            active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
        }`}
    >
        <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-500 group-hover:text-emerald-400'} transition-colors`} />
        {label}
        {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
    </button>
);

const StatCard = ({ label, value, color }) => (
    <div className={`px-6 py-4 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 min-w-[160px] flex flex-col justify-center items-center text-center`}>
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">{label}</span>
        <span className={`text-4xl font-black italic tracking-tighter ${color === 'red' ? 'text-red-500' : 'text-slate-900'}`}>{value}</span>
    </div>
);

const AdminSection = ({ title, children }) => (
    <div className="space-y-4">
        <div className="flex items-center gap-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</h4>
            <div className="h-px bg-slate-100 flex-1" />
        </div>
        {children}
    </div>
);

const AdminDetail = ({ label, value }) => (
    <div className="space-y-1">
        <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest block">{label}</label>
        <div className="font-bold text-slate-900 text-sm uppercase italic truncate" title={value}>{value || '—'}</div>
    </div>
);

export default AdminData;
