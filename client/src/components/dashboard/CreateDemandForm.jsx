import { useState } from 'react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import { X, ChevronRight, ChevronLeft, CheckCircle, FileText, DollarSign, Truck, ShieldCheck, Gavel, Sprout, Users } from 'lucide-react';

const CreateDemandForm = ({ onClose, onSuccess }) => {
    const [step, setStep] = useState(0); // Start at 0 for Contract Models
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        // Basic
        contractType: 'Market Specification',
        cropName: '',
        quantityRequired: '',
        pricePerTon: '',

        // 1. Crop Details
        variety: '',
        qualityStandards: '',
        procurementSeason: 'Kharif',
        procurementFrequency: 'One-time',
        packaging: '',

        // 2. Pricing
        priceType: 'Fixed',
        advancePaymentPercentage: '',
        milestonePlan: '30% Advance, 70% Delivery',

        // 3. Logistics
        deliveryType: 'Farmer Delivery',
        gpsRequired: false,

        // 4. Quality
        inspectionMethod: 'Manual',
        inspectionLocation: 'Collection Center',

        // 5. Validity
        deliveryBy: '',
        contractStartDate: '',
        contractEndDate: '',

        // 6. Legal
        jurisdiction: 'New Delhi',
        cancellationTerms: '7 days notice',
        contractUrl: '',
        contractFileName: '',

        // Additional
        additionalInstructions: ''
    });

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
            // Transform flat state to nested schema structure
            const payload = {
                contractType: formData.contractType,
                cropName: formData.cropName,
                quantityRequired: formData.quantityRequired,
                pricePerTon: formData.pricePerTon,
                deliveryBy: formData.deliveryBy,

                cropDetails: {
                    variety: formData.variety,
                    qualityStandards: formData.qualityStandards,
                    procurementSeason: formData.procurementSeason,
                    procurementFrequency: formData.procurementFrequency,
                    packaging: formData.packaging
                },
                pricing: {
                    priceType: formData.priceType,
                    advancePaymentPercentage: formData.advancePaymentPercentage,
                    milestonePlan: formData.milestonePlan
                },
                logistics: {
                    deliveryType: formData.deliveryType,
                    gpsRequired: formData.gpsRequired
                },
                qualityInspection: {
                    method: formData.inspectionMethod,
                    location: formData.inspectionLocation
                },
                contractValidity: {
                    startDate: formData.contractStartDate,
                    endDate: formData.contractEndDate
                },
                legal: {
                    jurisdiction: formData.jurisdiction,
                    cancellationTerms: formData.cancellationTerms,
                    contractUrl: formData.contractUrl,
                    contractFileName: formData.contractFileName
                },
                additionalInstructions: formData.additionalInstructions
            };

            const { data } = await api.post('/demands', payload);
            if (data.success) {
                console.log("Contract Created Successfully:", data);
                toast.success('Contract Offer Published Successfully!');
                onSuccess();
            } else {
                console.error("Success false but no throw:", data);
            }
        } catch (error) {
            console.error("Submit Error:", error);
            toast.error(error.response?.data?.error || 'Failed to publish contract');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 0, title: 'Model', icon: ShieldCheck },
        { id: 1, title: 'Basics', icon: Sprout },
        { id: 2, title: 'Pricing', icon: DollarSign },
        { id: 3, title: 'Logistics', icon: Truck },
        { id: 4, title: 'Legal', icon: Gavel },
    ];

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-white/20 max-h-[90vh]">

                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-8 text-white relative flex-shrink-0">
                    <div className="absolute top-0 right-0 p-4">
                        <button
                            onClick={onClose}
                            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition backdrop-blur-sm"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div>
                        <span className="bg-emerald-500/30 border border-emerald-400/30 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block backdrop-blur-md">New Contract Offer</span>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Post Requirement</h2>
                        <p className="text-emerald-50 text-base font-medium opacity-90">Create a binding offer for farmers to accept.</p>
                    </div>
                </div>

                {/* Stepper */}
                <div className="bg-white px-8 py-6 border-b border-gray-100">
                    <div className="flex justify-between items-center relative">
                        {/* Background Line */}
                        <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 rounded-full -z-0"></div>

                        {/* Active Progress Line */}
                        <div
                            className="absolute top-5 left-0 h-1 bg-emerald-500 rounded-full -z-0 transition-all duration-500 ease-out"
                            style={{ width: `${((step) / (steps.length)) * 100}%` }}
                        ></div>

                        {steps.map((s, i) => (
                            <div key={s.id} className="flex flex-col items-center relative z-10 group cursor-default">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-4 
                                    ${step >= s.id ? 'bg-emerald-600 border-emerald-100 text-white shadow-emerald-200 shadow-lg scale-110' : 'bg-white border-gray-200 text-gray-400'}`}>
                                    <s.icon className="w-4 h-4" />
                                </div>
                                <span className={`text-[11px] font-bold mt-2 uppercase tracking-wide transition-colors ${step >= s.id ? 'text-emerald-700' : 'text-gray-400'}`}>{s.title}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30 scroll-smooth">
                    <form id="contract-form" onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">

                        {/* STEP 0: CONTRACT MODEL SELECTION */}
                        {step === 0 && (
                            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                                <h3 className="text-xl font-bold text-gray-800 text-center mb-6">Choose Your Contract Model</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* 1. Market Specification */}
                                    <div
                                        onClick={() => setFormData({ ...formData, contractType: 'Market Specification' })}
                                        className={`p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg relative overflow-hidden group ${formData.contractType === 'Market Specification' ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-200 ring-offset-2' : 'border-gray-200 bg-white hover:border-emerald-200'}`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><FileText className="w-6 h-6" /></div>
                                            {formData.contractType === 'Market Specification' && <CheckCircle className="w-6 h-6 text-emerald-500" />}
                                        </div>
                                        <h4 className="font-bold text-gray-900 mb-1">Market Specification</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed">buyer provides specifications (quality, timing) & commits to buy. Farmer manages production.</p>
                                    </div>

                                    {/* 2. Production Contract */}
                                    <div
                                        onClick={() => setFormData({ ...formData, contractType: 'Production' })}
                                        className={`p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg relative overflow-hidden group ${formData.contractType === 'Production' ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-200 ring-offset-2' : 'border-gray-200 bg-white hover:border-emerald-200'}`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Sprout className="w-6 h-6" /></div>
                                            {formData.contractType === 'Production' && <CheckCircle className="w-6 h-6 text-emerald-500" />}
                                        </div>
                                        <h4 className="font-bold text-gray-900 mb-1">Production Contract</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed">Buyer supplies inputs (seeds, tech) & manages processes. Farmer provides land & labor.</p>
                                    </div>

                                    {/* 3. Buy-Back Agreement */}
                                    <div
                                        onClick={() => setFormData({ ...formData, contractType: 'Buy-Back' })}
                                        className={`p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg relative overflow-hidden group ${formData.contractType === 'Buy-Back' ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-200 ring-offset-2' : 'border-gray-200 bg-white hover:border-emerald-200'}`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><DollarSign className="w-6 h-6" /></div>
                                            {formData.contractType === 'Buy-Back' && <CheckCircle className="w-6 h-6 text-emerald-500" />}
                                        </div>
                                        <h4 className="font-bold text-gray-900 mb-1">Buy-Back Agreement</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed">Company finances the crop & guarantees purchase. Loan deducted from final payment.</p>
                                    </div>

                                    {/* 4. Price Guarantee */}
                                    <div
                                        onClick={() => setFormData({ ...formData, contractType: 'Price Guarantee' })}
                                        className={`p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg relative overflow-hidden group ${formData.contractType === 'Price Guarantee' ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-200 ring-offset-2' : 'border-gray-200 bg-white hover:border-emerald-200'}`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="bg-amber-100 p-2 rounded-lg text-amber-600"><ShieldCheck className="w-6 h-6" /></div>
                                            {formData.contractType === 'Price Guarantee' && <CheckCircle className="w-6 h-6 text-emerald-500" />}
                                        </div>
                                        <h4 className="font-bold text-gray-900 mb-1">Price Guarantee</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed">Pre-agreed fixed price regardless of market fluctuations. High security for farmers.</p>
                                    </div>

                                    {/* 5. Cluster Contract (Featured) */}
                                    <div
                                        onClick={() => setFormData({ ...formData, contractType: 'Cluster' })}
                                        className={`col-span-1 md:col-span-2 lg:col-span-1 p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg relative overflow-hidden group ${formData.contractType === 'Cluster' ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-200 ring-offset-2' : 'border-gray-200 bg-white hover:border-emerald-200'}`}
                                    >
                                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">POPULAR</div>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="bg-teal-100 p-2 rounded-lg text-teal-600"><Users className="w-6 h-6" /></div>
                                            {formData.contractType === 'Cluster' && <CheckCircle className="w-6 h-6 text-emerald-500" />}
                                        </div>
                                        <h4 className="font-bold text-gray-900 mb-1">Cluster Contract</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed">One large demand filled by multiple farmers. Ideal for large procurement.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 1: CROP BASICS */}
                        {step === 1 && (
                            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="group">
                                        <label className="text-sm font-bold text-gray-700 mb-2 block">Crop Name <span className="text-red-500">*</span></label>
                                        <input type="text" name="cropName" required value={formData.cropName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-gray-200 bg-white border-2 focus:border-emerald-500 focus:ring-0 transition-all font-semibold placeholder-gray-300" placeholder="e.g. Potato" autoFocus />
                                    </div>
                                    <div className="group">
                                        <label className="text-sm font-bold text-gray-700 mb-2 block">Total Quantity (Tons) <span className="text-red-500">*</span></label>
                                        <input type="number" name="quantityRequired" required value={formData.quantityRequired} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-gray-200 bg-white border-2 focus:border-emerald-500 focus:ring-0 transition-all font-semibold placeholder-gray-300" placeholder="1000" />
                                    </div>
                                    <div className="group">
                                        <label className="text-sm font-bold text-gray-700 mb-2 block">Specific Variety</label>
                                        <input type="text" name="variety" value={formData.variety} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-gray-200 bg-white border-2 focus:border-emerald-500 focus:ring-0 transition-all font-semibold placeholder-gray-300" placeholder="e.g. Lady Rosetta" />
                                    </div>
                                    <div className="group">
                                        <label className="text-sm font-bold text-gray-700 mb-2 block">Procurement Season</label>
                                        <select name="procurementSeason" value={formData.procurementSeason} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-gray-200 bg-white border-2 focus:border-emerald-500 focus:ring-0 transition-all font-semibold cursor-pointer appearance-none">
                                            <option>Kharif</option>
                                            <option>Rabi</option>
                                            <option>Zaid</option>
                                            <option>All Season</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="group">
                                    <label className="text-sm font-bold text-gray-700 mb-2 block">Quality Standards / Grades</label>
                                    <textarea name="qualityStandards" value={formData.qualityStandards} onChange={handleChange} rows="4" className="w-full px-4 py-3 rounded-xl border-gray-200 bg-white border-2 focus:border-emerald-500 focus:ring-0 transition-all font-semibold placeholder-gray-300 resize-none" placeholder="Describe quality parameters (moisture, size, color)..."></textarea>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: PRICING */}
                        {step === 2 && (
                            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                                <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex items-start gap-4">
                                    <div className="bg-blue-100 p-2 rounded-lg">
                                        <DollarSign className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-blue-900 text-sm mb-1">Competitive Pricing Strategy</h4>
                                        <p className="text-xs text-blue-700/80 leading-relaxed">Ensure your price is competitive. Market-linked prices generally attract 30% more applications from experienced farmers.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="group">
                                        <label className="text-sm font-bold text-gray-700 mb-2 block">Base Price (₹/Ton) <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-3.5 text-gray-400 font-bold">₹</span>
                                            <input type="number" name="pricePerTon" required value={formData.pricePerTon} onChange={handleChange} className="w-full pl-8 pr-4 py-3 rounded-xl border-gray-200 bg-white border-2 focus:border-emerald-500 focus:ring-0 transition-all font-bold text-lg placeholder-gray-300" placeholder="0.00" />
                                        </div>
                                    </div>
                                    <div className="group">
                                        <label className="text-sm font-bold text-gray-700 mb-2 block">Price Model</label>
                                        <select name="priceType" value={formData.priceType} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-gray-200 bg-white border-2 focus:border-emerald-500 focus:ring-0 transition-all font-semibold cursor-pointer">
                                            <option value="Fixed">Fixed Price</option>
                                            <option value="MSP + Bonus">MSP + Bonus</option>
                                            <option value="Market-linked">Market Linked</option>
                                        </select>
                                    </div>
                                    <div className="group">
                                        <label className="text-sm font-bold text-gray-700 mb-2 block">Advance Payment (%)</label>
                                        <div className="relative">
                                            <input type="number" name="advancePaymentPercentage" value={formData.advancePaymentPercentage} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-gray-200 bg-white border-2 focus:border-emerald-500 focus:ring-0 transition-all font-semibold placeholder-gray-300" placeholder="20" />
                                            <span className="absolute right-4 top-3.5 text-gray-400 font-bold">%</span>
                                        </div>
                                    </div>
                                    <div className="group">
                                        <label className="text-sm font-bold text-gray-700 mb-2 block">Payment Plan</label>
                                        <input type="text" name="milestonePlan" value={formData.milestonePlan} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-gray-200 bg-white border-2 focus:border-emerald-500 focus:ring-0 transition-all font-semibold placeholder-gray-300" placeholder="e.g. 20% sowing, 80% delivery" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: LOGISTICS */}
                        {step === 3 && (
                            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="group">
                                        <label className="text-sm font-bold text-gray-700 mb-2 block">Delivery Mode</label>
                                        <select name="deliveryType" value={formData.deliveryType} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-gray-200 bg-white border-2 focus:border-emerald-500 focus:ring-0 transition-all font-semibold cursor-pointer">
                                            <option>Farmer Delivery</option>
                                            <option>Company Pickup</option>
                                        </select>
                                    </div>
                                    <div className="group">
                                        <label className="text-sm font-bold text-gray-700 mb-2 block">Packaging Requirements</label>
                                        <input type="text" name="packaging" value={formData.packaging} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-gray-200 bg-white border-2 focus:border-emerald-500 focus:ring-0 transition-all font-semibold placeholder-gray-300" placeholder="e.g. 50kg Gunny Bags" />
                                    </div>
                                    <div className="group">
                                        <label className="text-sm font-bold text-gray-700 mb-2 block">Inspection Method</label>
                                        <select name="inspectionMethod" value={formData.inspectionMethod} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-gray-200 bg-white border-2 focus:border-emerald-500 focus:ring-0 transition-all font-semibold cursor-pointer">
                                            <option>Manual</option>
                                            <option>Lab Test</option>
                                            <option>AI Inspection</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:border-emerald-200 transition-colors cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, gpsRequired: !prev.gpsRequired }))}>
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${formData.gpsRequired ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white'}`}>
                                            {formData.gpsRequired && <CheckCircle className="w-4 h-4 text-white" />}
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-gray-800 font-bold text-sm cursor-pointer select-none block">Require GPS Enabled Transport</label>
                                            <p className="text-xs text-gray-500 mt-0.5">If checked, farmers must provide live tracking link/data during delivery.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: LEGAL & VALIDITY */}
                        {step === 4 && (
                            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="group">
                                        <label className="text-sm font-bold text-gray-700 mb-2 block">Contract Start Date</label>
                                        <input type="date" name="contractStartDate" value={formData.contractStartDate} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-gray-200 bg-white border-2 focus:border-emerald-500 focus:ring-0 transition-all font-semibold" />
                                    </div>
                                    <div className="group">
                                        <label className="text-sm font-bold text-gray-700 mb-2 block">Delivery Deadline <span className="text-red-500">*</span></label>
                                        <input type="date" name="deliveryBy" required value={formData.deliveryBy} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-gray-200 bg-white border-2 focus:border-emerald-500 focus:ring-0 transition-all font-semibold" />
                                    </div>
                                    <div className="group">
                                        <label className="text-sm font-bold text-gray-700 mb-2 block">Jurisdiction</label>
                                        <input type="text" name="jurisdiction" value={formData.jurisdiction} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-gray-200 bg-white border-2 focus:border-emerald-500 focus:ring-0 transition-all font-semibold placeholder-gray-300" />
                                    </div>
                                    <div className="group">
                                        <label className="text-sm font-bold text-gray-700 mb-2 block">Cancellation Terms</label>
                                        <input type="text" name="cancellationTerms" value={formData.cancellationTerms} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-gray-200 bg-white border-2 focus:border-emerald-500 focus:ring-0 transition-all font-semibold placeholder-gray-300" />
                                    </div>
                                    <div className="group">
                                        <label className="text-sm font-bold text-gray-700 mb-2 block">Contract Document (PDF)</label>
                                        <div className="flex items-center space-x-4">
                                            {formData.contractUrl ? (
                                                <div className="flex items-center bg-emerald-50 px-4 py-2 rounded-xl text-emerald-700 text-sm font-bold w-full border border-emerald-100">
                                                    <FileText className="w-4 h-4 mr-2" />
                                                    <span className="truncate flex-1">{formData.contractFileName}</span>
                                                    <button onClick={() => setFormData(prev => ({ ...prev, contractUrl: '', contractFileName: '' }))} className="text-red-500 hover:text-red-700 ml-2 p-1">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="relative w-full">
                                                    <input
                                                        type="file"
                                                        accept=".pdf"
                                                        onChange={async (e) => {
                                                            const file = e.target.files[0];
                                                            if (!file) return;

                                                            const uploadData = new FormData();
                                                            uploadData.append('image', file); // API expects 'image' key

                                                            setLoading(true);
                                                            try {
                                                                const { data: url } = await api.post('/upload', uploadData, {
                                                                    headers: {
                                                                        'Content-Type': 'multipart/form-data'
                                                                    }
                                                                });
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    contractUrl: url,
                                                                    contractFileName: file.name
                                                                }));
                                                                toast.success("PDF Uploaded!");
                                                            } catch (err) {
                                                                console.error("Upload failed", err);
                                                                toast.error(err.response?.data?.error || "Upload failed");
                                                            } finally {
                                                                setLoading(false);
                                                            }
                                                        }}
                                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-span-1 md:col-span-2 group">
                                        <label className="text-sm font-bold text-gray-700 mb-2 block">Additional Instructions</label>
                                        <textarea name="additionalInstructions" value={formData.additionalInstructions} onChange={handleChange} rows="3" className="w-full px-4 py-3 rounded-xl border-gray-200 bg-white border-2 focus:border-emerald-500 focus:ring-0 transition-all font-semibold placeholder-gray-300 resize-none" placeholder="Any other specific requirements, contact details, or notes?"></textarea>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center z-20 shadow-lg">
                    {step > 0 ? (
                        <button onClick={() => setStep(step - 1)} className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 flex items-center font-bold transition-all text-sm">
                            <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                        </button>
                    ) : (
                        <div></div>
                    )}

                    {step < 4 ? (
                        <button onClick={() => setStep(step + 1)} className="px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-black flex items-center font-bold shadow-xl shadow-gray-200 transition-all transform hover:-translate-y-1 active:scale-95 text-sm">
                            {step === 0 ? 'Configure Contract' : 'Next Step'} <ChevronRight className="w-4 h-4 ml-2" />
                        </button>
                    ) : (
                        <button onClick={handleSubmit} disabled={loading} className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl hover:from-emerald-700 hover:to-teal-800 flex items-center font-bold shadow-xl shadow-emerald-200 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed text-sm">
                            {loading ? 'Publishing...' : 'Publish Contract'} <CheckCircle className="w-5 h-5 ml-2" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateDemandForm;
