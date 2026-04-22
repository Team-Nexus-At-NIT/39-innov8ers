import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, AlertCircle, FileText, TrendingUp, User, MapPin, ArrowRight, Info, Clock, Download, IndianRupee, ShieldCheck, Package } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import RaiseIssueModal from './RaiseIssueModal';

const STATUS_STYLES = {
    'Active':       'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Completed':    'bg-blue-50   text-blue-700   border-blue-200',
    'Pending':      'bg-amber-50  text-amber-700  border-amber-200',
    'Cancelled':    'bg-red-50    text-red-700    border-red-200',
    'In Production':'bg-purple-50 text-purple-700 border-purple-200',
};

const DashboardContractCard = ({ contract, role }) => {
    const navigate = useNavigate();
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
    const isSigned    = role === 'farmer' ? contract.farmerSigned : contract.buyerSigned;
    const counterName = role === 'farmer'
        ? (contract.buyer?.name   || 'Unknown')
        : (contract.farmer?.name || 'Unknown');
    const counterId   = role === 'farmer' ? contract.buyer?._id : contract.farmer?._id;
    const statusStyle = STATUS_STYLES[contract.status] || 'bg-gray-50 text-gray-700 border-gray-200';

    return (
        <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-green-300 transition-all duration-300 flex flex-col group">

            {/* Header with Background Image */}
            <div 
                className="h-24 relative overflow-hidden"
            >
                {/* Real Harvest Background */}
                <img 
                    src="/market-bg.jpg" 
                    alt="Harvest" 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-black/40" />

                <div className="relative z-10 p-4 flex flex-col justify-between h-full">

                    <div className="flex justify-between items-center w-full">
                        <span className="text-[9px] font-black text-white/80 uppercase tracking-[0.15em] bg-white/10 px-2.5 py-1 rounded-md border border-white/20 backdrop-blur-md shadow-lg">
                            #{contract._id?.slice(-6).toUpperCase() ?? 'NEW'}
                        </span>
                        <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full border border-white/20 uppercase tracking-widest shadow-lg whitespace-nowrap">
                            {contract.status || 'Draft'}
                        </span>
                    </div>
                    <h3 className="relative z-10 font-black text-lg text-white leading-tight truncate drop-shadow-md uppercase tracking-tight italic -mb-1">
                        {contract.cropDetails?.cropName || contract.cropName || contract.demand?.cropName || 'Agreement'}
                    </h3>
                </div>
            </div>

            <div className="p-4 flex flex-col flex-1">


                {/* Counterpart */}
                <div className="flex items-center gap-1.5 mb-4">
                    <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <User className="w-2.5 h-2.5 text-green-700" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">Party:</span>
                    <span
                        onClick={(e) => { e.stopPropagation(); if (counterId) navigate(`/profile/${counterId}`); }}
                        className={cn('text-xs font-bold truncate', counterId ? 'text-green-700 hover:underline cursor-pointer' : 'text-gray-400')}
                    >
                        {counterName}
                    </span>
                </div>

                {/* Metrics */}
                <div className="bg-gray-50 rounded-xl border border-gray-100 divide-y divide-gray-100 mb-4 flex-1">
                    <div className="flex justify-between items-center px-3 py-2">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            <Package className="w-3 h-3" /> Volume
                        </span>
                        <span className="text-sm font-black text-gray-900">
                            {contract.cropDetails?.quantity || contract.quantity || '—'} Ton
                        </span>
                    </div>
                    <div className="flex justify-between items-center px-3 py-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Price</span>
                        <span className="text-sm font-black text-green-700">
                            ₹{contract.pricingTerms?.pricePerUnit || contract.pricePerTon || '—'}/t
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                    {isSigned ? (
                        <div className="flex items-center gap-1 text-emerald-700">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-black uppercase tracking-tight">Authorized</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-amber-600">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-black uppercase tracking-tight">Pending Sign</span>
                        </div>
                    )}
                    <button
                        onClick={() => navigate(`/contract/${contract._id}/track`)}
                        className="flex items-center gap-1.5 bg-slate-900 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md uppercase tracking-tighter group"
                    >
                        Details
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardContractCard;
