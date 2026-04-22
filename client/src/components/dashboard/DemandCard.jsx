import React, { useState } from 'react';
import {
    MapPin, Package, DollarSign, TrendingUp, Users,
    ChevronDown, ChevronUp, CheckCircle, Clock, User, ArrowRight, FileText, Info
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import api from '../../lib/axios';
import { useNavigate } from 'react-router-dom';
import ApplicantProfileModal from './ApplicantProfileModal';

const CONTRACT_DESCRIPTIONS = {
    'Market Specification': 'Buyer provides quality specs & commits to buy. You manage production.',
    'Production': 'Buyer supplies inputs (seeds, tech) & manages processes. You provide land & labor.',
    'Buy-Back': 'Company finances the crop & guarantees purchase. Loan deducted from payment.',
    'Price Guarantee': 'Fixed price guaranteed regardless of market value. High security.',
    'Cluster': 'Join other farmers to fill a large demand together.'
};

const STATUS_COLORS = {
    'active':    'bg-emerald-50 text-emerald-700 border-emerald-200',
    'closed':    'bg-gray-50    text-gray-600    border-gray-200',
    'fulfilled': 'bg-indigo-50  text-indigo-700  border-indigo-200',
};

const DemandCard = ({ demand, onAcceptBid, onUpdate }) => {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);

    const handleViewProfile = async (userId) => {
        if (!userId) return;
        setIsProfileOpen(true);
        setProfileLoading(true);
        try {
            const res = await api.get(`/profiles/user/${userId}`);
            setSelectedProfile(res.data.data);
        } catch (error) {
            console.error("Failed to fetch profile", error);
        } finally {
            setProfileLoading(false);
        }
    };

    const statusKey = (demand.status || 'Active').toLowerCase();
    const statusStyle = STATUS_COLORS[statusKey] || 'bg-blue-50 text-blue-700 border-blue-200';
    const clusterProgress = demand.contractType === 'Cluster'
        ? Math.min(100, ((demand.fulfilledQuantity || 0) / (demand.quantityRequired || 1)) * 100)
        : 0;

    return (
        <>
            <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-green-300 transition-all duration-300 flex flex-col group">

                {/* Header with Background Image */}
                <div 
                    className="h-24 relative overflow-hidden"
                >
                    {/* Real Harvest Background */}
                    <img 
                        src="/market-bg.jpg" 
                        alt="Harvest" 
                        className="absolute inset-0 w-full h-full object-cover shadow-inner transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-black/40" />

                    <div className="relative z-10 p-4 flex flex-col justify-between h-full">

                    <div className="flex justify-between items-center w-full">
                        {/* Type badge + tooltip */}
                        <div className="relative group/type">
                            <span className={cn(
                                'text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border border-white/20 backdrop-blur-md text-white cursor-help flex items-center gap-1 shadow-lg',
                                demand.contractType === 'Cluster'         && 'bg-teal-900/20',
                                demand.contractType === 'Price Guarantee' && 'bg-amber-900/20',
                                !['Cluster','Price Guarantee'].includes(demand.contractType) && 'bg-black/20'
                            )}>
                                {demand.contractType || 'Market Spec.'}
                                <Info className="w-3 h-3 opacity-70" />
                            </span>
                        </div>

                        <span className={cn('text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/20 backdrop-blur-md text-white shadow-lg', 
                            statusKey === 'active' ? 'bg-emerald-500/20' : 'bg-gray-500/20'
                        )}>
                            {demand.status || 'Active'}
                        </span>
                    </div>

                    <h3 className="font-black text-xl text-white leading-tight truncate drop-shadow-md uppercase tracking-tight italic -mb-1">
                        {demand.cropName || demand.cropDetails?.cropName || 'Untitled Demand'}
                    </h3>
                </div>
            </div>

                <div className="p-5 flex flex-col flex-1">


                    {/* Posted by */}
                    <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <User className="w-2.5 h-2.5 text-green-700" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">By:</span>
                        <span
                            onClick={(e) => { e.stopPropagation(); if (demand.buyer?._id) navigate(`/profile/${demand.buyer._id}`); }}
                            className={cn('text-xs font-bold truncate max-w-[150px]', demand.buyer?._id ? 'text-green-700 hover:underline cursor-pointer' : 'text-gray-400')}
                        >
                            {demand.buyer?.name || 'Unknown Company'}
                        </span>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium mb-5">
                        <Clock className="w-3 h-3" />
                        {demand.createdAt
                            ? `Posted ${formatDistanceToNow(new Date(demand.createdAt), { addSuffix: true })} • ${format(new Date(demand.createdAt), 'dd MMM yyyy')}`
                            : 'Recently Posted'}
                    </div>

                    {/* Cluster Progress */}
                    {demand.contractType === 'Cluster' && (
                        <div className="bg-teal-50 rounded-xl border border-teal-100 p-3 mb-4">
                            <div className="flex justify-between text-[10px] font-black text-teal-800 uppercase tracking-wider mb-2">
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Cluster Progress</span>
                                <span>{demand.fulfilledQuantity || 0} / {demand.quantityRequired} Tons</span>
                            </div>
                            <div className="w-full h-2 bg-teal-200 rounded-full overflow-hidden">
                                <div className="h-full bg-teal-600 rounded-full transition-all duration-700" style={{ width: `${clusterProgress}%` }} />
                            </div>
                            <p className="text-[10px] text-teal-600 font-medium mt-1.5">
                                {demand.applications?.length || 0} farmers currently participating
                            </p>
                        </div>
                    )}

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
                            <span className="flex items-center gap-1 text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                <Package className="w-3 h-3" /> Required
                            </span>
                            <span className="text-base font-black text-gray-900">{demand.quantityRequired} T</span>
                        </div>
                        <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Offered</span>
                            <span className="text-base font-black text-green-700">₹{demand.pricePerTon || demand.pricePerUnit}/t</span>
                        </div>
                    </div>

                    {/* Delivery */}
                    <div className="flex items-start gap-2 bg-gray-50 rounded-xl border border-gray-100 p-3 mb-4">
                        <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Delivery Location</span>
                            <span className="text-xs font-semibold text-gray-700 truncate block">
                                {demand.deliveryLocation?.address || 'Location not specified'}
                            </span>
                        </div>
                    </div>

                    {/* Collapsible Bids */}
                    <div className="rounded-xl border border-gray-100 overflow-hidden mb-4 flex-1">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className={cn(
                                'w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-all',
                                isExpanded ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    Bids / Applications ({demand.applications?.length || 0})
                                </span>
                            </div>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {isExpanded && (
                            <div className="bg-white divide-y divide-gray-50 max-h-72 overflow-y-auto">
                                {(!demand.applications || demand.applications.length === 0) ? (
                                    <div className="text-center py-8 px-4">
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No Applications Yet</p>
                                        <p className="text-gray-300 text-xs mt-1">Pending farmer submissions.</p>
                                    </div>
                                ) : (
                                    demand.applications.map((app) => (
                                        <div key={app._id} className="p-3">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-8 h-8 rounded-xl bg-green-800 text-white flex items-center justify-center font-black text-sm cursor-pointer hover:bg-green-700 transition-colors"
                                                        onClick={() => handleViewProfile(app.farmer?._id)}
                                                    >
                                                        {app.farmer?.name?.charAt(0) || 'F'}
                                                    </div>
                                                    <div>
                                                        <h4
                                                            className="font-black text-sm text-gray-900 hover:text-green-800 cursor-pointer transition-colors uppercase tracking-tight"
                                                            onClick={() => handleViewProfile(app.farmer?._id)}
                                                        >
                                                            {app.farmer?.name || 'Unknown Farmer'}
                                                        </h4>
                                                        <button
                                                            className="text-[9px] text-green-600 font-black uppercase tracking-wider hover:underline"
                                                            onClick={() => handleViewProfile(app.farmer?._id)}
                                                        >
                                                            <User className="w-2.5 h-2.5 inline mr-0.5" /> View Profile
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-black text-gray-900 text-sm">₹{app.pricePerUnit}/t</div>
                                                    <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Offered</div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 mb-2.5">
                                                <div className="bg-gray-50 rounded-lg p-2">
                                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block">Qty</span>
                                                    <span className="text-xs font-black text-gray-700">{app.offeredQuantity || '0'} Tons</span>
                                                </div>
                                                <div className="bg-gray-50 rounded-lg p-2 min-w-0">
                                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block">Note</span>
                                                    <span className="text-[10px] font-medium text-gray-500 italic truncate block">{app.message || 'N/A'}</span>
                                                </div>
                                            </div>

                                            {app.status === 'Pending' && demand.status === 'Open' ? (
                                                <button
                                                    onClick={() => onAcceptBid && onAcceptBid(demand._id, app)}
                                                    className="w-full py-2 bg-green-800 hover:bg-green-700 text-white text-xs font-black rounded-xl transition-colors flex items-center justify-center gap-1.5"
                                                >
                                                    Accept Offer <ArrowRight className="w-3.5 h-3.5" />
                                                </button>
                                            ) : (
                                                <div className={cn(
                                                    'w-full py-1.5 rounded-xl border text-center text-[9px] font-black uppercase tracking-widest',
                                                    app.status === 'Accepted' && 'bg-green-50 text-green-700 border-green-100',
                                                    app.status === 'Rejected' && 'bg-red-50 text-red-700 border-red-100',
                                                    !['Accepted','Rejected'].includes(app.status) && 'bg-gray-50 text-gray-500 border-gray-100'
                                                )}>
                                                    {app.status}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Legal PDF */}
                    {demand.legal?.contractUrl && (
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-gray-400">
                                <FileText className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-widest truncate max-w-[150px]">
                                    {demand.legal.contractFileName || 'Legal Agreement.pdf'}
                                </span>
                            </div>
                            <a
                                href={demand.legal.contractUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-black text-green-700 hover:underline uppercase tracking-wider"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Preview
                            </a>
                        </div>
                    )}
                </div>
            </div>

            <ApplicantProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                profile={selectedProfile}
                loading={profileLoading}
            />
        </>
    );
};

export default DemandCard;
