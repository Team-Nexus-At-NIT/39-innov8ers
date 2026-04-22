import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import { ShoppingBag, CheckCircle, Search, Filter, Info, Clock, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ApplyContractModal from './ApplyContractModal';
import { formatDistanceToNow } from 'date-fns';

const CONTRACT_DESCRIPTIONS = {
    'Market Specification': 'Buyer provides quality specs & commits to buy.',
    'Production': 'Buyer supplies inputs & manages processes.',
    'Buy-Back': 'Company finances crop & guarantees purchase.',
    'Price Guarantee': 'Fixed price guaranteed regardless of market.',
    'Cluster': 'Join other farmers to fill a large demand.'
};

const Marketplace = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const [demands, setDemands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDemand, setSelectedDemand] = useState(null); // For Modal
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

    const fetchDemands = async () => {
        try {
            const { data } = await api.get('/demands');
            if (data.success) {
                setDemands(data.data);
                
                // Auto-open if redirected from dashboard with state
                if (location.state?.openDemandId) {
                    const demand = data.data.find(d => d._id === location.state.openDemandId);
                    if (demand) {
                        setSelectedDemand(demand);
                        setIsApplyModalOpen(true);
                    }
                }
            }
        } catch (error) {
            console.error("Failed", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDemands();
    }, [location.state]);

    const handleApplyClick = (demand) => {
        setSelectedDemand(demand);
        setIsApplyModalOpen(true);
    };

    if (loading) return <div className="p-10 text-center">Loading Market...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">{t('Live Marketplace')}</h2>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search for crops..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {demands.map(demand => (
                    <div key={demand._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                        <div
                            className="h-32 relative flex flex-col justify-between overflow-hidden"
                        >
                            {/* Real Harvest Background */}
                            <img 
                                src="/market-bg.jpg" 
                                alt="Harvest" 
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                            />
                            <div className="absolute inset-0 bg-black/40" />

                            <div className="relative z-10 p-6 flex flex-col justify-between h-full">

                            <div className="flex justify-between items-center w-full">
                                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full border border-white/20 uppercase tracking-widest shadow-lg whitespace-nowrap">
                                    {demand.status}
                                </span>
                                {/* Contract Type Badge */}
                                <div className="group/tooltip relative">
                                    <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-lg border border-white/20 cursor-help uppercase tracking-wider shadow-lg hover:bg-black/60 transition-all whitespace-nowrap">
                                        {demand.contractType || 'Market Spec'}
                                        <Info className="w-3 h-3 opacity-70" />
                                    </span>
                                    <div className="absolute right-0 top-full mt-2 hidden group-hover/tooltip:block w-48 bg-gray-900/95 text-white text-[11px] p-3 rounded-xl shadow-2xl backdrop-blur-lg z-50 border border-white/10">
                                        <p className="font-medium leading-relaxed">
                                            {CONTRACT_DESCRIPTIONS[demand.contractType] || CONTRACT_DESCRIPTIONS['Market Specification']}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-white tracking-tight truncate drop-shadow-md uppercase italic -mb-1">{demand.cropName}</h3>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                            {/* Timestamp */}
                            <div className="flex items-center text-xs text-gray-400 font-medium -mt-2 mb-2">
                                <Clock className="w-3.5 h-3.5 mr-1" />
                                Posted {demand.createdAt ? formatDistanceToNow(new Date(demand.createdAt), { addSuffix: true }) : 'recently'}
                            </div>

                            <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('Quantity')}</p>
                                    <p className="text-xl font-bold text-gray-800">{demand.quantityRequired} Tons</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('Target Price')}</p>
                                    <p className="text-xl font-bold text-green-600">₹{demand.pricePerTon}<span className="text-sm text-gray-400">/ton</span></p>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm text-gray-500">
                                <div className="flex items-center font-medium text-gray-700">
                                    <ShoppingBag className="w-4 h-4 mr-2 text-gray-400" />
                                    Buyer:
                                    <span
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (demand.buyer?._id) navigate(`/profile/${demand.buyer._id}`);
                                        }}
                                        className={`ml-1 font-bold ${demand.buyer?._id ? "text-emerald-600 hover:text-emerald-800 hover:underline cursor-pointer" : "text-gray-400"}`}
                                        title={demand.buyer?._id ? "View Company Profile & Reviews" : ""}
                                    >
                                        {demand.buyer?.name || 'Unknown Company'}
                                    </span>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2">
                                    <div className="text-xs">
                                        <span className="font-bold text-gray-500 uppercase">Quality:</span>
                                        <span className="ml-1 text-gray-800">{demand.qualitySpecifications || 'Standard'}</span>
                                    </div>

                                    {/* PDF Download Link */}
                                    {demand.legal && demand.legal.contractUrl && (
                                        <a
                                            href={demand.legal.contractUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-xs text-emerald-600 font-bold hover:underline mt-1 pt-2 border-t border-gray-200"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <FileText className="w-3.5 h-3.5 mr-1.5" />
                                            View Legal Agreement PDF
                                        </a>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => handleApplyClick(demand)}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-emerald-600 hover:shadow-emerald-200 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center group/btn"
                            >
                                <CheckCircle className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                                {t('Make an Offer')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detailed Application Modal */}
            <ApplyContractModal
                isOpen={isApplyModalOpen}
                onClose={() => setIsApplyModalOpen(false)}
                demand={selectedDemand}
            />
        </div>
    );
};

export default Marketplace;
