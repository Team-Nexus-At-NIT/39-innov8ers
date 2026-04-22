import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, Loader2, User, MapPin, Tractor, Sprout, Handshake, Building2, Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../lib/axios';

const RegisterWizard = () => {
    const { t } = useTranslation();
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [role, setRole] = useState('farmer');
    const [isLoading, setIsLoading] = useState(false);

    const steps = role === 'farmer' ? [
        { id: 1, title: 'Identity', icon: User },
        { id: 2, title: 'Location', icon: MapPin },
        { id: 3, title: 'Farming', icon: Tractor },
        { id: 4, title: 'Preferences', icon: Handshake },
        { id: 5, title: 'Review', icon: Check },
    ] : [
        { id: 1, title: 'Company', icon: Building2 },
        { id: 2, title: 'Address', icon: MapPin },
        { id: 3, title: 'Review', icon: Check },
    ];

    const { register, handleSubmit, trigger, watch, setValue } = useForm({
        defaultValues: {
            smsAlerts: true,
            willingness: true,
            hasLogistics: false,
            notifications: true,
            role: 'farmer'
        }
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const payload = { ...data, role };

            // Fix: Map location and User fields
            if (role === 'buyer') {
                payload.location = data.headOfficeAddress;
                payload.name = data.companyName; // Map Company Name to User Name
                // Phone is now collected in the form
            } else {
                payload.location = data.village;
            }

            // Format Arrays
            ['primaryCrops', 'equipmentOwned', 'fertilizersUsed', 'contractCrops', 'cropTypes'].forEach(field => {
                if (typeof payload[field] === 'string') {
                    payload[field] = payload[field].split(',').map(s => s.trim()).filter(Boolean);
                }
            });

            await registerUser(payload);
            toast.success(t('Registration Successful!'));
            navigate('/dashboard');
        } catch (error) {
            console.error("Registration Error", error);
            toast.error(error.response?.data?.error || t('Registration Failed'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const loadingToast = toast.loading('Uploading document...');
            const { data } = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // data is the file path string
            setValue(fieldName, data);
            toast.success('Document uploaded!', { id: loadingToast });
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Upload failed. Please try again.', { id: loadingToast });
        }
    };

    // Define fields for each step to validate only current step's data
    const getStepFields = (step, role) => {
        if (role === 'farmer') {
            switch (step) {
                case 1: return ['name', 'fatherName', 'phone', 'altPhone', 'gender', 'dob', 'email', 'password'];
                case 2: return ['village', 'district', 'state', 'pincode', 'aadhaarNumber', 'panNumber', 'kccNumber', 'bankName', 'bankAccountNumber', 'ifscCode'];
                case 3: return ['totalLandArea', 'irrigationSource', 'soilType', 'experienceYears', 'primaryCrops', 'equipmentOwned', 'organic'];
                case 4: return ['willingness', 'contractCrops', 'minExpectedPrice', 'preferredDuration', 'paymentPreference', 'whatsappNumber', 'smsAlerts'];
                default: return [];
            }
        } else {
            // Buyer Role
            switch (step) {
                case 1: return ['companyName', 'companyType', 'authPersonName', 'phone', 'designation', 'email', 'password'];
                case 2: return ['headOfficeAddress', 'district', 'state', 'pincode', 'gstNumber', 'cin', 'companyPanNumber'];
                default: return [];
            }
        }
    };

    const nextStep = async () => {
        const fieldsToValidate = getStepFields(currentStep, role);
        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            setCurrentStep(prev => Math.min(prev + 1, steps.length));
        } else {
            toast.error(t('Please fill all required fields correctly'));
        }
    };

    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 bg-cover bg-center" style={{ backgroundImage: "url('https://media.istockphoto.com/id/1401722160/photo/sunny-plantation-with-growing-soya.jpg?s=612x612&w=0&k=20&c=r_Y3aJ-f-4Oye0qU_TBKvqGUS1BymFHdx3ryPkyyV0w=')" }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

            <div className="max-w-4xl w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh] relative z-10 border border-white/20">
                {/* Header */}
                <div className="bg-white border-b p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                        <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">Step {currentStep} of {steps.length}</span>
                    </div>
                    {/* Steps Indicator */}
                    <div className="flex items-center justify-between relative px-2">
                        <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -z-10 rounded"></div>
                        <div className="absolute left-0 top-1/2 h-1 bg-green-600 -z-10 rounded transition-all duration-300" style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}></div>

                        {steps.map((step) => (
                            <div key={step.id} className="flex flex-col items-center bg-white px-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all ${currentStep >= step.id ? 'border-green-600 bg-green-600 text-white shadow-lg' : 'border-gray-200 bg-white text-gray-400'}`}>
                                    <step.icon className="w-5 h-5" />
                                </div>
                                <span className={`text-xs font-bold mt-2 hidden sm:block uppercase tracking-wider ${currentStep >= step.id ? 'text-green-700' : 'text-gray-400'}`}>{step.title}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Scrollable Form Area */}
                <form className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/50">
                    <div className="max-w-3xl mx-auto space-y-8">

                        {/* Step 1: Identity / Company Info */}
                        {currentStep === 1 && (
                            <div className="animate-in slide-in-from-right duration-300">
                                <h3 className="section-header">
                                    <span className="bg-green-100 text-green-700 p-2 rounded-lg mr-3"><User className="w-5 h-5" /></span>
                                    Basic Information
                                </h3>

                                {/* Role Switcher */}
                                <div className="flex p-1.5 bg-gray-200 rounded-xl mb-10 w-full max-w-md mx-auto shadow-inner">
                                    <button type="button" onClick={() => setRole('farmer')} className={`flex-1 flex items-center justify-center py-3 rounded-lg font-bold text-sm transition-all duration-200 ${role === 'farmer' ? 'bg-white text-green-700 shadow-md ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}>
                                        <Tractor className="w-4 h-4 mr-2" /> Farmer
                                    </button>
                                    <button type="button" onClick={() => setRole('buyer')} className={`flex-1 flex items-center justify-center py-3 rounded-lg font-bold text-sm transition-all duration-200 ${role === 'buyer' ? 'bg-white text-blue-700 shadow-md ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}>
                                        <Building2 className="w-4 h-4 mr-2" /> Buyer / Enterprise
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    {role === 'buyer' ? (
                                        <>
                                            <div className="col-span-1 md:col-span-2">
                                                <label className="label">Registered Company Name <span className="text-red-500">*</span></label>
                                                <input {...register('companyName', { required: true })} className="input-field" placeholder="e.g. Agro Foods Pvt Ltd" />
                                            </div>
                                            <div>
                                                <label className="label">Company Type</label>
                                                <select {...register('companyType')} className="input-field">
                                                    <option value="Food Processing">Food Processing</option>
                                                    <option value="Exporter">Exporter</option>
                                                    <option value="Retail">Retail Chain</option>
                                                    <option value="Manufacturer">Manufacturer</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="label">Authorized Person Name</label>
                                                <input {...register('authPersonName')} className="input-field" />
                                            </div>
                                            <div>
                                                <label className="label">Official Mobile Number <span className="text-red-500">*</span></label>
                                                <input type="tel" {...register('phone', { required: true })} className="input-field" placeholder="For OTP/Alerts" />
                                            </div>
                                            <div>
                                                <label className="label">Designation</label>
                                                <input {...register('designation')} className="input-field" placeholder="e.g. Manager" />
                                            </div>
                                            <div>
                                                <label className="label">Company Email <span className="text-red-500">*</span></label>
                                                <input type="email" {...register('email', { required: true })} className="input-field" />
                                            </div>
                                            <div>
                                                <label className="label">Password <span className="text-red-500">*</span></label>
                                                <input type="password" {...register('password', { required: true, minLength: 6 })} className="input-field" />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="col-span-1">
                                                <label className="label">Full Name <span className="text-red-500">*</span></label>
                                                <input {...register('name', { required: true })} className="input-field" />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="label">Father's Name</label>
                                                <input {...register('fatherName')} className="input-field" />
                                            </div>
                                            <div>
                                                <label className="label">Mobile Number <span className="text-red-500">*</span></label>
                                                <input type="tel" {...register('phone', { required: true })} className="input-field" />
                                            </div>
                                            <div>
                                                <label className="label">Alternate Phone</label>
                                                <input type="tel" {...register('altPhone')} className="input-field" />
                                            </div>
                                            <div>
                                                <label className="label">Gender</label>
                                                <select {...register('gender')} className="input-field">
                                                    <option value="">Select</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="label">Date of Birth</label>
                                                <input type="date" {...register('dob')} className="input-field" />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="label">Email (Optional)</label>
                                                <input type="email" {...register('email', { required: false })} className="input-field" />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="label">Password <span className="text-red-500">*</span></label>
                                                <input type="password" {...register('password', { required: true, minLength: 6 })} className="input-field" />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Location / Address */}
                        {currentStep === 2 && (
                            <div className="animate-in slide-in-from-right duration-300">
                                <h3 className="section-header">Location & Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="label">{role === 'buyer' ? 'Head Office Address' : 'Village Name'} <span className="text-red-500">*</span></label>
                                        <input {...register(role === 'buyer' ? 'headOfficeAddress' : 'village', { required: true })} className="input-field" />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="label">District <span className="text-red-500">*</span></label>
                                        <input {...register('district', { required: true })} className="input-field" />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="label">State <span className="text-red-500">*</span></label>
                                        <input {...register('state', { required: true })} className="input-field" />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="label">Pincode <span className="text-red-500">*</span></label>
                                        <input {...register('pincode', { required: true })} className="input-field" />
                                    </div>

                                    {role === 'buyer' && (
                                        <>
                                            <div className="col-span-1 md:col-span-2 mt-4 pb-2 border-b"><h4 className="font-bold text-lg text-gray-800">Business Registration</h4></div>
                                            <div className="col-span-1">
                                                <label className="label">GST Number</label>
                                                <input {...register('gstNumber')} className="input-field" />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="label">CIN Number</label>
                                                <input {...register('cin')} className="input-field" />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="label">Company PAN</label>
                                                <input {...register('companyPanNumber')} className="input-field" />
                                            </div>
                                        </>
                                    )}
                                    {role === 'farmer' && (
                                        <>
                                            <div className="col-span-1 md:col-span-2 mt-4 pb-2 border-b"><h4 className="font-bold text-lg text-green-800">KYC & Bank Details</h4></div>
                                            <div className="col-span-1">
                                                <label className="label">Aadhaar Number</label>
                                                <input {...register('aadhaarNumber')} className="input-field" placeholder="12-digit Aadhaar" />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="label">Upload Aadhaar (Front)</label>
                                                <input type="file" onChange={(e) => handleFileUpload(e, 'aadhaarFront')} className="input-field p-2" accept="image/*,application/pdf" />
                                                {watch('aadhaarFront') && <span className="text-xs text-green-600 font-bold block mt-1">✓ File Uploaded</span>}
                                            </div>
                                            <div className="col-span-1">
                                                <label className="label">PAN Number</label>
                                                <input {...register('panNumber')} className="input-field" />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="label">KCC Number</label>
                                                <input {...register('kccNumber')} className="input-field" />
                                            </div>
                                            <div className="col-span-1 md:col-span-2 mt-4 bg-blue-50/50 p-4 sm:p-6 rounded-xl border border-blue-100">
                                                <h5 className="font-bold text-blue-900 mb-4">Bank Account</h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="col-span-1 md:col-span-2">
                                                        <label className="label">Bank Name</label>
                                                        <input {...register('bankName')} className="input-field" />
                                                    </div>
                                                    <div>
                                                        <label className="label">Account Number</label>
                                                        <input {...register('bankAccountNumber')} className="input-field" />
                                                    </div>
                                                    <div>
                                                        <label className="label">IFSC Code</label>
                                                        <input {...register('ifscCode')} className="input-field" />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Farming (Farmer Only) */}
                        {currentStep === 3 && role === 'farmer' && (
                            <div className="animate-in slide-in-from-right duration-300">
                                <h3 className="section-header">Farming Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="col-span-1 md:col-span-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-4">
                                        <label className="label block mb-2">Upload 7/12 Extract (Land Record)</label>
                                        <input type="file" onChange={(e) => handleFileUpload(e, 'landRecord')} className="input-field p-2 bg-white" accept="image/*,application/pdf" />
                                        {watch('landRecord') && <span className="text-xs text-green-600 font-bold block mt-1">✓ File Uploaded</span>}
                                    </div>
                                    <div>
                                        <label className="label">Total Land (Acres)</label>
                                        <input type="number" {...register('totalLandArea')} className="input-field" />
                                    </div>
                                    <div>
                                        <label className="label">Irrigation Source</label>
                                        <select {...register('irrigationSource')} className="input-field">
                                            <option value="Rainfed">Rainfed</option>
                                            <option value="Borewell">Borewell</option>
                                            <option value="Canal">Canal</option>
                                            <option value="Drip">Drip</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">Soil Type</label>
                                        <select {...register('soilType')} className="input-field">
                                            <option value="">Select</option>
                                            <option value="Black">Black</option>
                                            <option value="Red">Red</option>
                                            <option value="Sandy">Sandy</option>
                                            <option value="Clay">Clay</option>
                                            <option value="Loamy">Loamy</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">Experience (Years)</label>
                                        <input type="number" {...register('experienceYears')} className="input-field" />
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="label">Primary Crops</label>
                                        <input {...register('primaryCrops')} className="input-field" placeholder="e.g. Wheat, Rice" />
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="label">Equipment Owned</label>
                                        <input {...register('equipmentOwned')} className="input-field" placeholder="e.g. Tractor, Sprayer" />
                                    </div>
                                    <div className="col-span-1 flex items-center space-x-3 pt-4 p-4 bg-green-50 rounded-xl border border-green-100">
                                        <input type="checkbox" {...register('organic')} className="w-5 h-5 text-green-600 rounded" />
                                        <label className="font-bold text-gray-800">I practice Organic Farming</label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Preferences (Farmer Only) */}
                        {currentStep === 4 && role === 'farmer' && (
                            <div className="animate-in slide-in-from-right duration-300">
                                <h3 className="section-header">Preferences</h3>
                                <div className="space-y-6">
                                    <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                                        <div className="flex items-center justify-between mb-6 border-b border-yellow-200 pb-2">
                                            <label className="font-bold text-gray-800 text-lg">Contract Willingness</label>
                                            <input type="checkbox" {...register('willingness')} className="w-6 h-6 text-green-600 rounded" />
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="label">Preferred Contract Crops</label>
                                                <input {...register('contractCrops')} className="input-field" placeholder="e.g. Potato, Maize" />
                                            </div>
                                            <div>
                                                <label className="label">Min Expected Price (₹)</label>
                                                <input type="number" {...register('minExpectedPrice')} className="input-field" />
                                            </div>
                                            <div>
                                                <label className="label">Preferred Duration</label>
                                                <select {...register('preferredDuration')} className="input-field">
                                                    <option value="3 Months">3 Months</option>
                                                    <option value="6 Months">6 Months</option>
                                                    <option value="12 Months">12 Months</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="label">Payment Preference</label>
                                                <select {...register('paymentPreference')} className="input-field">
                                                    <option value="Bank Transfer">Bank Transfer</option>
                                                    <option value="UPI">UPI</option>
                                                    <option value="Cash">Cash</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                        <h4 className="font-bold mb-4 text-gray-800">Communication Settings</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="col-span-1">
                                                <label className="label">WhatsApp Number</label>
                                                <input {...register('whatsappNumber')} className="input-field" />
                                            </div>
                                            <div className="col-span-1 flex items-end pb-3">
                                                <div className="flex items-center space-x-3 w-full p-3 bg-white rounded-lg border">
                                                    <input type="checkbox" {...register('smsAlerts')} className="w-5 h-5 rounded" />
                                                    <label className="font-medium">Receive SMS Alerts</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Review */}
                        {currentStep === 5 && (
                            <div className="animate-in slide-in-from-right duration-300 text-center py-12">
                                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-inner border-4 border-green-50">
                                    <Check className="h-10 w-10" />
                                </div>
                                <h3 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Ready to Register!</h3>
                                <p className="text-gray-600 max-w-lg mx-auto mb-8 text-lg">
                                    You are creating a <strong>{role === 'buyer' ? 'Corporate/Buyer' : 'Farmer'}</strong> account for <br />
                                    <span className="text-green-700 font-bold text-xl">{role === 'buyer' ? watch('companyName') : watch('name')}</span>
                                </p>
                            </div>
                        )}
                    </div>
                </form>

                {/* Footer Controls */}
                <div className="p-6 border-t bg-white flex justify-between items-center z-10 w-full shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <button
                        type="button"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <ChevronLeft className="h-5 w-5 mr-2" />
                        {t('Back')}
                    </button>

                    {currentStep < 5 ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="flex items-center px-10 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black hover:scale-105 transition-all shadow-lg shadow-gray-200"
                        >
                            {t('Next Step')}
                            <ChevronRight className="h-5 w-5 ml-2" />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit(onSubmit)}
                            disabled={isLoading}
                            className="flex items-center px-10 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 hover:scale-105 transition-all shadow-lg shadow-green-200"
                        >
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                            {t('Create Account')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegisterWizard;
