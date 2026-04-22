import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
    CheckCircle, Clock, Truck, FileText, IndianRupee,
    MapPin, Calendar, ChevronRight, AlertCircle,
    Leaf, Upload, ShieldCheck, Phone, ArrowLeft, User,
    MoreHorizontal, Layers, Activity, Search, Printer
} from 'lucide-react';
import { format } from 'date-fns';
import Navbar from '../../components/Navbar';
import BlockchainCertificate from '../../components/dashboard/BlockchainCertificate';
import EscrowDashboard from '../../components/dashboard/EscrowDashboard';
import RaiseIssueModal from '../../components/dashboard/RaiseIssueModal';

const TrackContract = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('timeline'); // timeline, logistics, payments

    // Safe Date Formatter
    const safeDate = (dateStr, formatStr = 'MMM d, yyyy') => {
        try {
            if (!dateStr) return 'N/A';
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return 'Invalid Date';
            return format(date, formatStr);
        } catch (e) {
            return '--';
        }
    };

    useEffect(() => {
        const fetchContract = async () => {
            try {
                const { data } = await api.get(`/contracts/${id}`);
                setContract(data.data);
            } catch (error) {
                console.error("Failed to load contract", error);
                toast.error("Failed to load contract details");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchContract();
    }, [id]);

    // --- Actions ---
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updateType, setUpdateType] = useState(null);
    const [formData, setFormData] = useState({});
    const [uploading, setUploading] = useState(false);
    const [location, setLocation] = useState(null);
    const [locationStatus, setLocationStatus] = useState('idle');
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        setUploading(true);
        try {
            const { data } = await api.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setFormData(prev => ({ ...prev, evidenceUrl: data }));
            toast.success('Evidence uploaded successfully');
        } catch (error) {
            console.error(error);
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const getLocation = () => {
        setLocationStatus('loading');
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported');
            setLocationStatus('error');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lng: longitude });
                setLocationStatus('success');
                toast.success('Location coordinates captured');
            },
            () => {
                toast.error('Unable to retrieve location');
                setLocationStatus('error');
            }
        );
    };

    const handleAction = async () => {
        setLoading(true);
        try {
            let payload = { actionType: updateType };

            if (updateType === 'UPDATE_PROGRESS') {
                if (!formData.evidenceUrl) {
                    toast.error("Please upload photo evidence");
                    setLoading(false);
                    return;
                }
                if (!location) {
                    toast.error("Please capture GPS location");
                    setLoading(false);
                    return;
                }
                payload.stage = formData.stage;
                payload.remarks = formData.remarks;
                payload.evidenceUrl = [formData.evidenceUrl];
                payload.coordinates = location;
            } else if (updateType === 'UPDATE_LOGISTICS') {
                payload.logisticsData = {
                    status: formData.status,
                    vehicleNumber: formData.vehicle,
                    driverName: formData.driver
                };
            } else if (updateType === 'UPDATE_PAYMENT') {
                payload.paymentData = {
                    amount: formData.amount,
                    stage: formData.paymentStage,
                    transactionId: formData.txnId
                };
            }

            await api.put(`/contracts/${id}/fulfillment`, payload);
            toast.success('Official record updated successfully');
            setShowUpdateModal(false);
            setFormData({});
            setLocation(null);
            setLocationStatus('idle');

            const res = await api.get(`/contracts/${id}`);
            setContract(res.data.data);
        } catch (error) {
            console.error(error);
            toast.error('Update operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (timelineId, status) => {
        if (!confirm(`Confirm ${status} for this stage? This action is irreversible.`)) return;
        try {
            await api.put(`/contracts/${id}/fulfillment`, {
                actionType: 'VERIFY_STAGE',
                timelineId,
                verificationStatus: status
            });
            toast.success(`Stage marked as ${status}`);
            const res = await api.get(`/contracts/${id}`);
            setContract(res.data.data);
        } catch (error) {
            toast.error('Verification process failed');
        }
    };

    const UpdateModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
                <div className="bg-blue-900 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white capitalize flex items-center">
                        <FileText className="w-5 h-5 mr-2" /> Official {updateType?.replace('UPDATE_', '').toLowerCase()} Update
                    </h3>
                    <button onClick={() => setShowUpdateModal(false)} className="text-white/70 hover:text-white transition">
                        ✕
                    </button>
                </div>

                <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                    {updateType === 'UPDATE_PROGRESS' && (
                        <>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Crop Stage</label>
                                <select
                                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                                >
                                    <option value="">Select Stage...</option>
                                    <option value="Sowing">Sowing Completed</option>
                                    <option value="Mid-Season">Mid-Season Maintenance</option>
                                    <option value="Harvest">Harvest Ready</option>
                                    <option value="Completed">Mark Complete (Farmer Side)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Field Evidence (Mandatory)</label>
                                <div className="border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-white hover:border-blue-400 transition cursor-pointer relative">
                                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} />
                                    {uploading ? <p className="text-blue-600 font-bold text-sm">Uploading...</p> :
                                        formData.evidenceUrl ? (
                                            <div className="flex items-center text-green-600 font-bold text-sm"><CheckCircle className="w-4 h-4 mr-2" /> Evidence Attached</div>
                                        ) : (
                                            <>
                                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-600 font-medium">Click to Upload Photo</p>
                                            </>
                                        )}
                                </div>
                            </div>

                            <button
                                onClick={getLocation}
                                className={`w-full py-3 rounded-lg font-bold text-sm border flex items-center justify-center transition ${locationStatus === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
                            >
                                {locationStatus === 'loading' ? 'Locating...' : locationStatus === 'success' ? <><MapPin className="w-4 h-4 mr-2" /> Location Tagged</> : <><MapPin className="w-4 h-4 mr-2" /> Tag GPS Location</>}
                            </button>

                            <textarea
                                rows="2"
                                placeholder="Inspection remarks..."
                                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            />
                        </>
                    )}

                    {updateType === 'UPDATE_LOGISTICS' && (
                        <>
                            <select className="w-full p-3 bg-gray-50 border rounded-lg text-sm" onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                <option value="">Select Status</option>
                                <option value="Scheduled">Scheduled</option>
                                <option value="Picked Up">Picked Up</option>
                                <option value="Delivered">Delivered</option>
                            </select>
                            <input placeholder="Vehicle Number" className="w-full p-3 bg-gray-50 border rounded-lg text-sm" onChange={e => setFormData({ ...formData, vehicle: e.target.value })} />
                            <input placeholder="Driver Name" className="w-full p-3 bg-gray-50 border rounded-lg text-sm" onChange={e => setFormData({ ...formData, driver: e.target.value })} />
                        </>
                    )}

                    {updateType === 'UPDATE_PAYMENT' && (
                        <>
                            <select className="w-full p-3 bg-gray-50 border rounded-lg text-sm" onChange={(e) => setFormData({ ...formData, paymentStage: e.target.value })}>
                                <option value="">Payment Type</option>
                                <option value="Advance">Advance</option>
                                <option value="Milestone">Milestone</option>
                                <option value="Final Settlement">Final Settlement</option>
                            </select>
                            <input type="number" placeholder="Amount (₹)" className="w-full p-3 bg-gray-50 border rounded-lg text-sm" onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                            <input placeholder="Transaction Reference ID" className="w-full p-3 bg-gray-50 border rounded-lg text-sm" onChange={e => setFormData({ ...formData, txnId: e.target.value })} />
                        </>
                    )}

                    <div className="pt-4 border-t border-gray-100 flex gap-3">
                        <button onClick={() => setShowUpdateModal(false)} className="flex-1 py-3 border border-gray-300 rounded-lg font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                        <button
                            onClick={handleAction}
                            disabled={loading || uploading}
                            className="flex-1 py-3 bg-blue-900 text-white rounded-lg font-bold hover:bg-blue-800 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Submit Update'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin h-10 w-10 border-4 border-blue-900 border-t-transparent rounded-full"></div></div>;
    if (!contract) return <div className="min-h-screen flex items-center justify-center">Contract Not Found</div>;

    const role = (user?.role || '').toLowerCase() === 'farmer' ? 'farmer' : 'buyer';
    const progress = contract.fulfillment?.percentage || 0;

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            <Navbar />
            {showUpdateModal && <UpdateModal />}

            {/* 1. Official Hero Section */}
            <div 
                className="relative pt-10 pb-24 text-white overflow-hidden"
            >
                {/* Real Harvest Background */}
                <img 
                    src="/market-bg.jpg" 
                    alt="Harvest" 
                    className="absolute inset-0 w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />


                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center text-blue-200 hover:text-white mb-6 font-medium text-sm transition">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                    </button>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="bg-white/10 border border-white/20 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                                    Contract #{contract._id?.slice(-8).toUpperCase()}
                                </span>
                                <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border ${contract.status === 'Active' ? 'bg-green-500/20 border-green-400/30 text-green-300' : 'bg-gray-500/20 border-gray-400/30 text-gray-300'
                                    }`}>
                                    {contract.status}
                                </span>
                            </div>
                            <h1 className="text-4xl font-black tracking-tight mb-2 text-white">{contract.cropDetails?.cropName || contract.cropName} Production</h1>
                            <p className="text-blue-100 flex items-center text-sm font-medium">
                                <User className="w-4 h-4 mr-2 opacity-70" />
                                {role === 'farmer' ? `Buyer: ${contract.buyer?.name}` : `Farmer: ${contract.farmer?.name}`}
                                <span className="mx-3 text-blue-400">|</span>
                                <Calendar className="w-4 h-4 mr-2 opacity-70" /> {safeDate(contract.createdAt)}
                            </p>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                            <div className="bg-white/10 border border-white/10 rounded-xl p-4 min-w-[200px] backdrop-blur-md">
                                <p className="text-xs font-bold text-blue-200 uppercase mb-1">Total Value</p>
                                <p className="text-2xl font-black text-white">₹{((contract.pricingTerms?.pricePerUnit || 0) * (contract.cropDetails?.quantity || 0)).toLocaleString()}</p>
                            </div>
                            <button
                                onClick={() => setIsIssueModalOpen(true)}
                                className="flex items-center gap-2 px-6 py-2 bg-red-600/20 hover:bg-red-600 text-white border border-red-500/30 rounded-lg text-xs font-black uppercase tracking-widest transition-all backdrop-blur-md shadow-lg shadow-red-900/20 group"
                            >
                                <AlertCircle className="w-4 h-4 text-red-400 group-hover:text-white transition-colors" />
                                Rise Dispute / Issue
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <RaiseIssueModal 
                isOpen={isIssueModalOpen} 
                onClose={() => setIsIssueModalOpen(false)} 
                contractId={contract._id} 
            />

            {/* 2. Main Content Grid */}
            <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Timeline & Log */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Tabs */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1.5 flex gap-1 overflow-x-auto">
                            {['timeline', 'logistics', 'payments'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 px-4 py-3 rounded-lg text-sm font-bold capitalize transition whitespace-nowrap ${activeTab === tab ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    {tab} Data
                                </button>
                            ))}
                        </div>

                        {/* Timeline Panel */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px]">
                            {activeTab === 'timeline' && (
                                <div className="p-8">
                                    <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900">Production Milestones</h3>
                                            <p className="text-sm text-gray-500">Official timeline of crop lifecycle</p>
                                        </div>
                                        {role === 'farmer' && (
                                            <button
                                                onClick={() => { setUpdateType('UPDATE_PROGRESS'); setShowUpdateModal(true); }}
                                                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 shadow transition flex items-center"
                                            >
                                                <Upload className="w-4 h-4 mr-2" /> Update Status
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-0 relative border-l-2 border-gray-100 ml-4">
                                        {(contract.fulfillment?.timeline || []).map((event, idx) => (
                                            <div key={idx} className="mb-10 ml-8 relative">
                                                <div className={`absolute -left-[41px] top-1 w-5 h-5 rounded-full border-2 border-white shadow-sm z-10 ${event.status === 'Verified' ? 'bg-green-500' :
                                                    event.status === 'Pending Verification' ? 'bg-amber-400' : 'bg-gray-300'
                                                    }`}></div>

                                                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5 hover:bg-white hover:shadow-md transition duration-200">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h4 className="font-bold text-gray-900">{event.stage}</h4>
                                                            <p className="text-xs text-gray-500 font-medium">{safeDate(event.date, 'MMM d, yyyy • h:mm a')}</p>
                                                        </div>
                                                        <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded border ${event.status === 'Verified' ? 'bg-green-50 text-green-700 border-green-200' :
                                                            event.status === 'Pending Verification' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                                                            }`}>
                                                            {event.status}
                                                        </span>
                                                    </div>

                                                    <p className="text-sm text-gray-600 mb-4">{event.remarks}</p>

                                                    <div className="flex gap-3">
                                                        {event.coordinates?.lat && (
                                                            <a href={`https://maps.google.com/?q=${event.coordinates.lat},${event.coordinates.lng}`} target="_blank" className="flex items-center text-xs font-bold text-blue-600 hover:underline">
                                                                <MapPin className="w-3 h-3 mr-1" /> View Map
                                                            </a>
                                                        )}
                                                        {event.evidenceUrl?.map((url, i) => (
                                                            <a key={i} href={url.startsWith('http') ? url : url} target="_blank" className="flex items-center text-xs font-bold text-blue-600 hover:underline">
                                                                <FileText className="w-3 h-3 mr-1" /> Evidence {i + 1}
                                                            </a>
                                                        ))}
                                                    </div>

                                                    {role !== 'farmer' && event.status === 'Pending Verification' && (
                                                        <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3">
                                                            <button onClick={() => handleVerify(event._id, 'Verified')} className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700">Verify</button>
                                                            <button onClick={() => handleVerify(event._id, 'Rejected')} className="px-4 py-2 border border-red-200 text-red-600 text-xs font-bold rounded hover:bg-red-50">Reject</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {(!contract.fulfillment?.timeline || contract.fulfillment?.timeline?.length === 0) && (
                                            <div className="text-center py-10 ml-[-20px]">
                                                <p className="text-gray-400 text-sm">No timeline updates recorded.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'logistics' && (
                                <div className="p-8">
                                    <div className="flex justify-between items-center mb-8">
                                        <h3 className="text-lg font-black text-gray-900">Logistics Status</h3>
                                        {role !== 'farmer' && <button onClick={() => { setUpdateType('UPDATE_LOGISTICS'); setShowUpdateModal(true); }} className="text-blue-600 text-sm font-bold hover:underline">Edit Info</button>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Status</p>
                                            <p className="font-bold text-gray-900">{contract.fulfillment?.logistics?.status || 'Pending'}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Vehicle No.</p>
                                            <p className="font-bold text-gray-900">{contract.fulfillment?.logistics?.vehicleNumber || 'N/A'}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Driver</p>
                                            <p className="font-bold text-gray-900">{contract.fulfillment?.logistics?.driverName || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'payments' && (
                                <div className="p-8">
                                    <EscrowDashboard contract={contract} onEscrowUpdate={(updatedContract) => setContract(updatedContract)} />

                                    <div className="flex justify-between items-center mb-8 mt-10">
                                        <h3 className="text-lg font-black text-gray-900">Release & Transaction History</h3>
                                        {role !== 'farmer' && <button onClick={() => { setUpdateType('UPDATE_PAYMENT'); setShowUpdateModal(true); }} className="bg-green-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-green-700">Record Manual Payment</button>}
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mb-8">
                                        <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                                            <p className="text-[10px] uppercase font-bold text-green-600 mb-1">Paid</p>
                                            <p className="text-xl font-black text-green-800">₹{(contract.fulfillment?.payments?.totalPaid || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                                            <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Pending</p>
                                            <p className="text-xl font-black text-gray-800">₹{(contract.fulfillment?.payments?.pendingAmount || 0).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {(contract.fulfillment?.payments?.history || []).map((p, i) => (
                                            <div key={i} className="flex justify-between items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                                                <div>
                                                    <p className="font-bold text-sm text-gray-900">{p.stage}</p>
                                                    <p className="text-xs text-gray-500 font-mono">{p.transactionId}</p>
                                                </div>
                                                <span className="font-bold text-gray-900">₹{p.amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                        {(!contract.fulfillment?.payments?.history?.length) && <p className="text-gray-400 text-sm text-center">No payment records found.</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Status & Quality */}
                    <div className="space-y-6">
                        {/* Overall Progress */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="font-bold text-sm text-gray-900 mb-4 flex items-center">
                                <Activity className="w-4 h-4 mr-2 text-blue-600" /> Completion Status
                            </h3>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl font-black text-blue-900">{progress}%</span>
                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">On Track</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>

                        {/* Signatures */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                <span className="text-sm font-medium text-gray-600">Farmer Signature</span>
                                <CheckCircle className={`w-5 h-5 ${contract.farmerSigned ? 'text-green-500' : 'text-gray-300'}`} />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">Buyer Signature</span>
                                <CheckCircle className={`w-5 h-5 ${contract.buyerSigned ? 'text-green-500' : 'text-gray-300'}`} />
                            </div>
                        </div>

                        {/* Blockchain Verify - Always show status */}
                        <BlockchainCertificate contractId={contract._id} />

                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center">
                            <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <h4 className="font-bold text-gray-900 text-sm mb-1">Quality Assurance</h4>
                            <p className="text-xs text-gray-500">Automated quality checks configured for Harvest stage.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrackContract;
