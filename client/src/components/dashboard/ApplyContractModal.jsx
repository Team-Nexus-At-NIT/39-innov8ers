import { useState } from 'react';
import { X, Upload, Calendar, Truck, DollarSign, Sprout, AlertCircle, FileText, CheckCircle, MapPin, Scale, ShieldCheck } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const ApplyContractModal = ({ isOpen, onClose, demand }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        bidPrice: '',
        offeredQuantity: '',
        canDeliver: false,
        deliveryDateStart: '',
        deliveryDateEnd: '',
        message: '',
        landDocument: '',
        cropPhotos: []
    });

    if (!isOpen || !demand) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                bidPrice: Number(formData.bidPrice),
                offeredQuantity: Number(formData.offeredQuantity),
                canDeliver: formData.canDeliver,
                deliveryDate: {
                    startDate: formData.deliveryDateStart,
                    endDate: formData.deliveryDateEnd
                },
                message: formData.message,
                // In a real app, we'd upload files first and get URLs. 
                // Passing dummy check for now as requested by user "visible fields"
                landDocument: "https://placeholder.com/7-12-document.pdf",
                cropPhotos: ["https://placeholder.com/crop-photo-1.jpg"]
            };

            const { data } = await api.post(`/demands/${demand._id}/apply`, payload);
            if (data.success) {
                toast.success('Your offer has been submitted to the buyer!');
                onClose();
            }
        } catch (error) {
            console.error("Apply failed", error);
            toast.error(error.response?.data?.error || 'Failed to submit application');
        } finally {
            setLoading(false);
        }
    };

    // Helper for rendering contract term sections
    const TermSection = ({ icon: Icon, title, children }) => (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4">
            <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                <Icon className="w-3.5 h-3.5 mr-2 text-gray-400" /> {title}
            </h4>
            <div className="space-y-2 text-sm text-gray-700 font-medium">
                {children}
            </div>
        </div>
    );

    const DetailRow = ({ label, value }) => (
        <div className="flex justify-between items-start">
            <span className="text-gray-500 text-xs font-semibold uppercase w-1/3">{label}</span>
            <span className="text-gray-900 w-2/3 text-right">{value || '--'}</span>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto animate-in fade-in zoom-in duration-200">

                {/* LEFT COLUMN: Contract Specifications (Read-Only) */}
                <div className="w-full md:w-5/12 bg-emerald-50/30 p-6 md:p-8 border-r border-gray-200 overflow-y-auto md:max-h-[85vh] relative">
                    <div 
                        className="absolute inset-0 opacity-[0.08] pointer-events-none" 
                        style={{ 
                            backgroundImage: 'url(/market-bg.jpg)', 
                            backgroundSize: 'cover', 
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                        }} 
                    />

                    
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black text-gray-900 mb-1">{demand.cropName} Contract</h2>

                    <p className="text-sm font-bold text-gray-500 mb-6 flex items-center">
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wider mr-2">Official Demand</span>
                        #{demand._id.slice(-8).toUpperCase()}
                    </p>

                    <div className="space-y-6">
                        {/* 1. Core Terms */}
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-end mb-4 border-b border-gray-100 pb-4">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Target Qty</p>
                                    <p className="text-2xl font-black text-gray-900">{demand.quantityRequired} <span className="text-sm text-gray-500">Tons</span></p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-gray-400 uppercase">Base Price</p>
                                    <p className="text-2xl font-black text-green-600">₹{demand.pricePerTon}<span className="text-sm text-gray-500">/t</span></p>
                                </div>
                            </div>
                            <DetailRow label="Buyer" value={demand.buyer?.name} />
                        </div>

                        {/* 2. Crop Details */}
                        <TermSection icon={Sprout} title="Crop Specifications">
                            <DetailRow label="Variety" value={demand.cropDetails?.variety} />
                            <DetailRow label="Quality Grade" value={demand.cropDetails?.qualityStandards || demand.qualitySpecifications} />
                            <DetailRow label="Packaging" value={demand.cropDetails?.packaging} />
                        </TermSection>

                        {/* 3. Pricing & Payment */}
                        <TermSection icon={DollarSign} title="Payment Terms">
                            <DetailRow label="Type" value={demand.pricing?.priceType} />
                            {demand.pricing?.advancePaymentPercentage > 0 && (
                                <DetailRow label="Advance" value={`${demand.pricing.advancePaymentPercentage}% Pre-Harvest`} />
                            )}
                            <DetailRow label="Schedule" value={demand.pricing?.milestonePlan || "On Delivery"} />
                        </TermSection>

                        {/* 4. Logistics */}
                        <TermSection icon={Truck} title="Logistics & Delivery">
                            <DetailRow label="Responsibility" value={demand.logistics?.deliveryType || "Farmer Delivery"} />
                            <DetailRow label="Location" value={demand.qualityInspection?.location || "Collection Center"} />
                            <DetailRow label="Deadline" value={demand.deliveryBy ? new Date(demand.deliveryBy).toLocaleDateString() : 'N/A'} />
                        </TermSection>

                        {/* 5. Legal Warning */}
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-6">
                            <div className="flex gap-3 mb-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                <div>
                                    <h5 className="font-bold text-amber-800 text-xs uppercase mb-1">Contract Validity</h5>
                                    <p className="text-xs text-amber-700 leading-relaxed">
                                        By applying, you agree to supply the offered quantity ensuring the quality standards mentioned above. {demand.legal?.penaltyClauses ? `Penalty: ${demand.legal.penaltyClauses}` : ''}
                                    </p>
                                </div>
                            </div>

                            {/* PDF Link */}
                            {demand.legal && demand.legal.contractUrl && (
                                <a
                                    href={demand.legal.contractUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-full py-2.5 bg-white border border-amber-200 rounded-lg text-amber-800 text-xs font-bold hover:bg-amber-100 transition shadow-sm"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Read Full Legal Agreement (PDF)
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>


                {/* RIGHT COLUMN: Application Form */}
                <div className="w-full md:w-7/12 flex flex-col max-h-[90vh]">
                    <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                        <h3 className="text-lg font-black text-gray-800">Submit Your Offer</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-8 overflow-y-auto flex-1">
                        <form id="applicationForm" onSubmit={handleSubmit} className="space-y-8">

                            {/* Quantity & Price */}
                            <section>
                                <h4 className="text-sm font-bold text-gray-900 border-b pb-2 mb-4 flex items-center">
                                    <span className="bg-gray-900 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2">1</span>
                                    Offer Terms
                                </h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Offered Quantity (Qt)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="offeredQuantity"
                                                required
                                                min="1"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 outline-none font-bold text-gray-900"
                                                placeholder="e.g. 50"
                                                value={formData.offeredQuantity}
                                                onChange={handleChange}
                                            />
                                            <span className="absolute right-4 top-3.5 text-xs font-bold text-gray-400">TONS</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Bid Price (₹/Ton)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-3.5 font-bold text-gray-400">₹</span>
                                            <input
                                                type="number"
                                                name="bidPrice"
                                                required
                                                min="1"
                                                className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 outline-none font-bold text-gray-900"
                                                placeholder={demand.pricePerTon}
                                                value={formData.bidPrice}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Logistics */}
                            <section>
                                <h4 className="text-sm font-bold text-gray-900 border-b pb-2 mb-4 flex items-center">
                                    <span className="bg-gray-900 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2">2</span>
                                    Logistics
                                </h4>
                                <div className="mb-4">
                                    <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                                        <input
                                            type="checkbox"
                                            name="canDeliver"
                                            checked={formData.canDeliver}
                                            onChange={handleChange}
                                            className="w-5 h-5 text-green-600 rounded focus:ring-green-500 mr-3"
                                        />
                                        <span className="text-sm font-bold text-gray-700">I can transport crop to collection center</span>
                                    </label>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Available From</label>
                                        <input type="date" name="deliveryDateStart" required className="w-full p-3 bg-gray-50 border rounded-xl outline-none text-sm font-medium" value={formData.deliveryDateStart} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Until</label>
                                        <input type="date" name="deliveryDateEnd" required className="w-full p-3 bg-gray-50 border rounded-xl outline-none text-sm font-medium" value={formData.deliveryDateEnd} onChange={handleChange} />
                                    </div>
                                </div>
                            </section>

                            {/* Uploads */}
                            <section>
                                <h4 className="text-sm font-bold text-gray-900 border-b pb-2 mb-4 flex items-center">
                                    <span className="bg-gray-900 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2">3</span>
                                    Verification (Optional)
                                </h4>
                                <div className="flex gap-4">
                                    <div className="flex-1 border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-green-400 hover:bg-green-50 transition cursor-pointer group">
                                        <Upload className="w-6 h-6 text-gray-300 group-hover:text-green-500 mb-2" />
                                        <span className="text-xs font-bold text-gray-500 group-hover:text-green-700">Land Record (7/12)</span>
                                    </div>
                                    <div className="flex-1 border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-green-400 hover:bg-green-50 transition cursor-pointer group">
                                        <Upload className="w-6 h-6 text-gray-300 group-hover:text-green-500 mb-2" />
                                        <span className="text-xs font-bold text-gray-500 group-hover:text-green-700">Crop Photos</span>
                                    </div>
                                </div>
                            </section>

                            <textarea
                                name="message"
                                rows="3"
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-green-500 text-sm font-medium"
                                placeholder="Add notes for the buyer (e.g. 'Harvest quality is premium', 'Need transport help')"
                                value={formData.message}
                                onChange={handleChange}
                            ></textarea>

                        </form>
                    </div>

                    <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center z-10">
                        <p className="text-xs text-gray-500 max-w-[200px]">By submitting, you agree to the platform terms.</p>
                        <div className="flex gap-3">
                            <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition">Cancel</button>
                            <button
                                onClick={() => document.getElementById('applicationForm').requestSubmit()}
                                disabled={loading}
                                className={`px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 transform hover:-translate-y-1 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Sending...' : 'Confirm & Apply'}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ApplyContractModal;
