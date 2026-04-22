import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, AlertCircle, FileText, TrendingUp, User, MapPin, ArrowRight, Info, Clock, Download, IndianRupee, ShieldCheck, Package } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

const CONTRACT_DESCRIPTIONS = {
    'Market Specification': 'Buyer provides quality specs & commits to buy. You manage production.',
    'Production': 'Buyer supplies inputs (seeds, tech) & manages processes. You provide land & labor.',
    'Buy-Back': 'Company finances the crop & guarantees purchase. Loan deducted from payment.',
    'Price Guarantee': 'Fixed price guaranteed regardless of market value. High security.',
    'Cluster': 'Join other farmers to fill a large demand together.'
};

const STATUS_STYLES = {
    'Active':    'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100',
    'Proposed':  'bg-amber-50  text-amber-700  border-amber-200  ring-amber-100',
    'Completed': 'bg-blue-50   text-blue-700   border-blue-200   ring-blue-100',
    'Cancelled': 'bg-red-50    text-red-700    border-red-200    ring-red-100',
};

const ContractCard = ({ contract, role }) => {
    const navigate = useNavigate();
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
    const isSigned = role === 'farmer' ? contract.farmerSigned : contract.buyerSigned;
    const counterName = role === 'farmer'
        ? (contract.buyer?.name   || 'Waiting for Buyer')
        : (contract.farmer?.name || 'Waiting for Farmer');
    const counterId   = role === 'farmer' ? contract.buyer?._id : contract.farmer?._id;

    const statusStyle = STATUS_STYLES[contract.status] || 'bg-gray-50 text-gray-700 border-gray-200';

    const totalValue = (contract.pricingTerms?.pricePerUnit || contract.pricePerTon || 0)
                     * (contract.cropDetails?.quantity       || contract.quantity    || 0);
    const fundedPct  = totalValue > 0
        ? Math.min(100, ((contract.escrow?.totalFunded || 0) / totalValue) * 100)
        : 0;

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
                        <span className={cn(
                            'text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border border-white/20 backdrop-blur-md text-white cursor-help flex items-center gap-1 shadow-lg',
                            contract.contractType === 'Cluster'         && 'bg-teal-900/20',
                            contract.contractType === 'Price Guarantee' && 'bg-amber-900/20',
                            !['Cluster','Price Guarantee'].includes(contract.contractType) && 'bg-black/20'
                        )}>
                            {contract.contractType || 'Standard'}
                            <Info className="w-2.5 h-2.5 opacity-70" />
                        </span>

                        <span className={cn('text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border border-white/20 backdrop-blur-md text-white w-fit shadow-lg')}>
                            {contract.status || 'DRAFT'}
                        </span>
                    </div>

                    <h3 className="font-black text-xl text-white leading-tight truncate drop-shadow-md uppercase tracking-tight italic -mb-1">
                        {contract.cropDetails?.cropName || contract.cropName || contract.demand?.cropName || 'Contract Agreement'}
                    </h3>
                </div>
            </div>

            <div className="p-5 flex flex-col flex-1">


                {/* Counterpart */}
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                        <User className="w-3 h-3 text-green-700" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {role === 'farmer' ? 'Buyer' : 'Farmer'}:
                    </span>
                    <span
                        onClick={(e) => { e.stopPropagation(); if (counterId) navigate(`/profile/${counterId}`); }}
                        className={cn('text-xs font-bold truncate max-w-[140px]', counterId ? 'text-green-700 hover:underline cursor-pointer' : 'text-gray-400')}
                    >
                        {counterName}
                    </span>
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium mb-5">
                    <Clock className="w-3 h-3" />
                    {contract.createdAt
                        ? `Initiated ${formatDistanceToNow(new Date(contract.createdAt), { addSuffix: true })}`
                        : 'Recently initiated'}
                </div>

                {/* Key Metrics */}
                <div className="bg-gray-50 rounded-xl border border-gray-100 divide-y divide-gray-100 mb-4 flex-1">
                    <div className="flex justify-between items-center px-4 py-2.5">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            <Package className="w-3.5 h-3.5" /> Quantity
                        </div>
                        <span className="text-sm font-black text-gray-900">
                            {contract.cropDetails?.quantity || contract.quantity || '—'} Tons
                        </span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            <IndianRupee className="w-3.5 h-3.5" /> Price/Ton
                        </div>
                        <span className="text-sm font-black text-green-700">
                            ₹{contract.pricingTerms?.pricePerUnit || contract.pricePerTon || '—'}
                        </span>
                    </div>

                    {/* Escrow row */}
                    <div className="px-4 py-3 space-y-2">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Escrow
                            </div>
                            <span className={cn(
                                'text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full whitespace-nowrap shadow-sm',
                                contract.escrow?.status === 'Funded'           && 'bg-emerald-100 text-emerald-800',
                                contract.escrow?.status === 'Partially Funded' && 'bg-amber-100 text-amber-800',
                                !['Funded','Partially Funded'].includes(contract.escrow?.status) && 'bg-gray-100 text-gray-500'
                            )}>
                                {contract.escrow?.status || 'Pending'}
                            </span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-1000 relative"
                                style={{ width: `${fundedPct}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
                            <div className="flex flex-col">
                                <span className="text-gray-400 text-[8px] tracking-widest">Target</span>
                                <span className="text-gray-900">₹{totalValue.toLocaleString()}</span>
                            </div>
                            <div className="text-right flex flex-col">
                                <span className="text-gray-400 text-[8px] tracking-widest uppercase">Secured</span>
                                <span className="text-emerald-700">₹{(contract.escrow?.totalFunded || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PDF Download */}
                {contract.legal?.contractUrl && (
                    <a
                        href={contract.legal.contractUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center gap-2 w-full mb-3 py-2 border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors uppercase tracking-wider"
                    >
                        <FileText className="w-3.5 h-3.5" />
                        Download Official Document
                    </a>
                )}

                {/* Footer row */}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                    {isSigned ? (
                        <div className="flex items-center gap-1.5 text-emerald-700">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-tight">Authorized</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-amber-600">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-tight">Pending Sign</span>
                        </div>
                    )}

                    <button
                        onClick={() => navigate(`/contract/${contract._id}/track`)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-800 hover:bg-green-700 text-white text-xs font-black rounded-xl transition-all shadow-md group"
                    >
                        View Details
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContractCard;
