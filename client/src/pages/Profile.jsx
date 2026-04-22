import { useState, useEffect, createContext, useContext } from 'react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
    User, MapPin, Building2, CreditCard, FileText, Printer, CheckCircle,
    Shield, Phone, Mail, Tractor, Sprout, Briefcase, Edit2, Save, X,
    Loader2, TrendingUp, Award, Calendar, Home, Languages, Smartphone,
    FileCheck, Globe, Info, Droplets
} from 'lucide-react';

export const ProfileContext = createContext({});

// -------------------------------------------------------------
// Helper Components extracted to prevent React re-render unmounting
// -------------------------------------------------------------
const DataRow = ({ label, value, section, field, type = 'text', options = [], fullWidth = false }) => {
    const { isEditing, formData, handleChange, themeColor } = useContext(ProfileContext);
    const isEditable = isEditing && section && field;

    let rawVal = '';
    if (section && formData[section]) rawVal = formData[section][field];
    else if (!section && formData[field]) rawVal = formData[field];
    
    if (rawVal === undefined || rawVal === null) rawVal = '';

    const displayVal = type === 'array' && Array.isArray(rawVal) ? rawVal.join(', ') : rawVal;

    const onInputChange = (e) => {
        let newVal = e.target.value;
        if (type === 'number') newVal = Number(newVal);
        handleChange(section, field, newVal);
    };

    const handleBlur = (e) => {
        if (type === 'array' && typeof rawVal === 'string') {
            const arrParsed = e.target.value.split(',').map(s => s.trim()).filter(s => s);
            handleChange(section, field, arrParsed);
        }
    };

    return (
        <div className={`p-4 border-b border-gray-100 last:border-0 ${fullWidth ? 'col-span-1 md:col-span-2' : ''} hover:bg-gray-50 transition`}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{label}</p>
            {isEditable ? (
                type === 'select' ? (
                    <select
                        className={`w-full p-3 bg-white border border-gray-200 shadow-sm rounded-lg focus:ring-2 focus:ring-${themeColor}-500 focus:border-${themeColor}-500 outline-none text-sm font-medium transition`}
                        value={rawVal || ''}
                        onChange={onInputChange}
                    >
                        <option value="">Select Option</option>
                        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                ) : (
                    <input
                        type={type === 'array' ? 'text' : type}
                        className={`w-full p-3 bg-white border border-gray-200 shadow-sm rounded-lg focus:ring-2 focus:ring-${themeColor}-500 focus:border-${themeColor}-500 outline-none text-sm font-medium transition`}
                        value={displayVal}
                        onChange={onInputChange}
                        onBlur={handleBlur}
                        placeholder={type === 'array' ? 'e.g., Wheat, Rice' : 'Not Specified'}
                    />
                )
            ) : (
                <p className="text-sm font-bold text-gray-800 break-words leading-relaxed">
                    {Array.isArray(value) ? (value.length > 0 ? value.join(', ') : <span className="text-gray-300 italic">None</span>) : (value || <span className="text-gray-300 italic">Not Specified</span>)}
                </p>
            )}
        </div>
    );
};

const SectionTitle = ({ icon: Icon, title }) => {
    const { themeColor } = useContext(ProfileContext);
    return (
        <div className={`bg-gray-50 px-6 py-4 border-y border-gray-100 flex items-center`}>
            {Icon && <Icon className={`w-5 h-5 text-${themeColor}-600 mr-3`} />}
            <h3 className={`text-sm font-black text-${themeColor}-900 uppercase tracking-widest`}>{title}</h3>
        </div>
    );
};
// -------------------------------------------------------------


const Profile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);

    const isFarmer = user.role === 'farmer';
    const themeColor = isFarmer ? 'emerald' : 'blue';

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/profiles/me');
                if (data.success) {
                    setProfile(data.data);
                    setFormData(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
                toast.error("Could not load profile data");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (section, field, value) => {
        if (!section) {
            setFormData(prev => ({ ...prev, [field]: value }));
            return;
        }
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...(prev[section] || {}),
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const endpoint = isFarmer ? '/profiles/farmer' : '/profiles/buyer';
            const { data } = await api.post(endpoint, formData);
            if (data.success) {
                setProfile(data.data);
                setIsEditing(false);
                toast.success('Profile updated successfully!');
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center">
                <Loader2 className={`h-10 w-10 text-${themeColor}-600 animate-spin mb-4`} />
                <p className="text-gray-500 font-medium tracking-wide">Retrieving Official Record...</p>
            </div>
        </div>
    );


    return (
        <ProfileContext.Provider value={{ isEditing, formData, handleChange, themeColor }}>
            <div className="min-h-screen py-10 px-4 md:px-8 font-sans relative">
            {/* Background Image & Overlay */}
            <div
                className="fixed inset-0 z-0"
                style={{
                    backgroundImage: isFarmer
                        ? `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop')`
                        : `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed'
                }}
            >
                <div className={`absolute inset-0 bg-gradient-to-br ${isFarmer ? 'from-green-900/80 to-emerald-900/80' : 'from-slate-900/80 to-blue-900/80'} backdrop-blur-sm`}></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">

                {/* 1. Header Card - Identity */}
                <div className="bg-white rounded-t-xl shadow-sm border-b border-gray-200 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-${themeColor}-500 to-${themeColor}-700`}></div>

                    <div className="flex items-center gap-6 z-10">
                        <div className={`w-24 h-24 bg-${themeColor}-50 rounded-full flex items-center justify-center border-4 border-white shadow-lg`}>
                            <User className={`w-10 h-10 text-${themeColor}-600`} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight">{user.name}</h1>
                                {profile?.kyc?.verificationStatus === 'Verified' && (
                                    <CheckCircle className="w-6 h-6 text-green-500 fill-white" />
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-gray-500">
                                <span className="px-3 py-1 bg-gray-100 rounded text-xs font-bold uppercase tracking-wide border border-gray-200">
                                    {isFarmer ? 'Farmer Account' : 'Buyer Profile'}
                                </span>
                                <span className="flex items-center"><Mail className="w-3.5 h-3.5 mr-1.5" /> {user.email}</span>
                                <span className="flex items-center"><Phone className="w-3.5 h-3.5 mr-1.5" /> {user.phone}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 z-10">
                        {!isEditing ? (
                            <>
                                <button onClick={() => window.print()} className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 transition">
                                    <Printer className="w-4 h-4 mr-2" /> Print
                                </button>
                                <button onClick={() => setIsEditing(true)} className={`flex items-center px-6 py-2 bg-${themeColor}-600 text-white rounded-lg shadow-md text-sm font-bold hover:bg-${themeColor}-700 transition`}>
                                    <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => { setIsEditing(false); setFormData(profile); }} className="flex items-center px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg shadow-sm text-sm font-bold hover:bg-red-50 transition">
                                    <X className="w-4 h-4 mr-2" /> Cancel
                                </button>
                                <button onClick={handleSave} disabled={saving} className={`flex items-center px-6 py-2 bg-green-600 text-white rounded-lg shadow-md text-sm font-bold hover:bg-green-700 transition ${saving ? 'opacity-70' : ''}`}>
                                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Changes
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* 2. Main Data Grid */}
                <div className="bg-white rounded-b-xl shadow-sm border border-t-0 border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[800px]">

                        {/* Left Sidebar: Quick Status & Communication */}
                        <div className="lg:col-span-3 border-r border-gray-200 bg-gray-50/50">
                            <div className="p-6 space-y-8">

                                {/* Status Card */}
                                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Profile Status</p>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-sm font-bold ${profile?.kyc?.verificationStatus === 'Verified' ? 'text-green-600' : 'text-amber-600'}`}>
                                            {profile?.kyc?.verificationStatus || 'Pending'}
                                        </span>
                                        <div className={`w-2 h-2 rounded-full ${profile?.kyc?.verificationStatus === 'Verified' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></div>
                                    </div>
                                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                        <div className={`h-full ${profile?.kyc?.verificationStatus === 'Verified' ? 'bg-green-500' : 'bg-amber-500'} w-full`}></div>
                                    </div>
                                </div>

                                {/* Communication */}
                                <div>
                                    <h4 className="text-xs font-black text-gray-900 uppercase mb-4 flex items-center"><Smartphone className="w-4 h-4 mr-2" /> Communication</h4>
                                    <div className="space-y-4 text-sm">
                                        {isFarmer ? (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Language</span>
                                                    <span className="font-bold text-gray-900">{profile?.personalDetails?.languagePref === 'hi' ? 'Hindi' : 'English'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">SMS Alerts</span>
                                                    <span className={`font-bold ${profile?.communication?.smsAlerts ? 'text-green-600' : 'text-gray-400'}`}>{profile?.communication?.smsAlerts ? 'Enabled' : 'Disabled'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">WhatsApp</span>
                                                    <span className="font-bold text-gray-900">{profile?.communication?.whatsappNumber || '-'}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Website</span>
                                                    <a href={profile?.website} className="font-bold text-blue-600 truncate max-w-[120px]">{profile?.website || '-'}</a>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Documents Preview */}
                                <div>
                                    <h4 className="text-xs font-black text-gray-900 uppercase mb-4 flex items-center"><FileCheck className="w-4 h-4 mr-2" /> Documents</h4>
                                    <div className="space-y-2">
                                        {(isFarmer ? ['Aadhaar', 'Land Record (7/12)', 'Passbook'] : ['GST Certificate', 'PAN Card', 'Company Reg']).map((doc, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                                <span className="text-xs font-medium text-gray-600">{doc}</span>
                                                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded font-bold uppercase">Pending</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="lg:col-span-9 bg-white">
                            {isFarmer ? (
                                <>
                                    {/* A. Personal Details */}
                                    <SectionTitle icon={User} title="Personal Information" />
                                    <div className="grid grid-cols-1 md:grid-cols-2">
                                        <DataRow label="Father's Name" value={profile?.personalDetails?.fatherName} section="personalDetails" field="fatherName" />
                                        <DataRow label="Date of Birth" value={profile?.personalDetails?.dob ? new Date(profile.personalDetails.dob).toLocaleDateString() : ''} section="personalDetails" field="dob" type="date" />
                                        <DataRow label="Gender" value={profile?.personalDetails?.gender} section="personalDetails" field="gender" type="select" options={['Male', 'Female', 'Other']} />
                                        <DataRow label="Alt Phone" value={profile?.personalDetails?.altPhone} section="personalDetails" field="altPhone" />
                                        <DataRow label="Language" value={profile?.personalDetails?.languagePref} section="personalDetails" field="languagePref" type="select" options={['en', 'hi']} />
                                    </div>

                                    {/* C. Location */}
                                    <SectionTitle icon={MapPin} title="Address & Location" />
                                    <div className="grid grid-cols-1 md:grid-cols-2">
                                        <DataRow label="State" value={profile?.location?.state} section="location" field="state" />
                                        <DataRow label="District" value={profile?.location?.district} section="location" field="district" />
                                        <DataRow label="Taluka/Block" value={profile?.location?.taluka} section="location" field="taluka" />
                                        <DataRow label="Village" value={profile?.location?.village} section="location" field="village" />
                                        <DataRow label="Pincode" value={profile?.location?.pincode} section="location" field="pincode" />
                                        <DataRow label="GPS Coordinates" value={profile?.location?.gpsCoordinates?.coordinates?.join(', ') || 'Not Tagged'} />
                                    </div>

                                    {/* D. Land Details */}
                                    <SectionTitle icon={Tractor} title="Land & Farming" />
                                    <div className="grid grid-cols-1 md:grid-cols-3">
                                        <DataRow label="Total Land (Acres)" value={profile?.landDetails?.totalLandArea} section="landDetails" field="totalLandArea" type="number" />
                                        <DataRow label="Cultivable (Acres)" value={profile?.landDetails?.cultivableArea} section="landDetails" field="cultivableArea" type="number" />
                                        <DataRow label="Irrigation" value={profile?.landDetails?.irrigationSource} section="landDetails" field="irrigationSource" type="select" options={['Borewell', 'Canal', 'Rainfed', 'Drip']} />
                                        <DataRow label="Soil Type" value={profile?.landDetails?.soilType} section="landDetails" field="soilType" type="select" options={['Black', 'Red', 'Alluvial', 'Clay']} />
                                        <DataRow label="Water Score (1-10)" value={profile?.landDetails?.waterAvailabilityScore} section="landDetails" field="waterAvailabilityScore" type="number" />
                                        <DataRow label="Equipment Owned" value={profile?.landDetails?.equipmentOwned} section="landDetails" field="equipmentOwned" type="array" fullWidth />
                                    </div>

                                    {/* E. Crop Production */}
                                    <SectionTitle icon={Sprout} title="Crop Production Profile" />
                                    <div className="grid grid-cols-1 md:grid-cols-2">
                                        <DataRow label="Primary Crops (Comma separated)" value={profile?.cropDetails?.primaryCrops} section="cropDetails" field="primaryCrops" type="array" fullWidth />
                                        <DataRow label="Avg Past Yield" value={profile?.cropDetails?.averagePastYield} section="cropDetails" field="averagePastYield" />
                                        <DataRow label="Experience (Years)" value={profile?.cropDetails?.experienceYears} section="cropDetails" field="experienceYears" type="number" />
                                        <DataRow label="Farming Type" value={profile?.cropDetails?.organic ? 'Organic' : 'Conventional'} section="cropDetails" field="organic" type="select" options={['Conventional', 'Organic']} />
                                        <DataRow label="Seasonal Capacity (MT)" value={profile?.cropDetails?.seasonalCapacity} section="cropDetails" field="seasonalCapacity" type="number" />
                                        <DataRow label="Fertilizers Used" value={profile?.cropDetails?.fertilizersUsed} section="cropDetails" field="fertilizersUsed" type="array" />
                                        <DataRow label="Recent Pest Challenges" value={profile?.cropDetails?.pestChallenges} section="cropDetails" field="pestChallenges" type="array" />
                                    </div>

                                    {/* G. Preferences */}
                                    <SectionTitle icon={FileText} title="Contract Preferences" />
                                    <div className="grid grid-cols-1 md:grid-cols-2">
                                        <DataRow label="Preferred Duration" value={profile?.contractPreferences?.preferredDuration} section="contractPreferences" field="preferredDuration" type="select" options={['3 Months', '6 Months', '12 Months']} />
                                        <DataRow label="Min Price Expectation (₹)" value={profile?.contractPreferences?.minExpectedPrice} section="contractPreferences" field="minExpectedPrice" type="number" />
                                        <DataRow label="Mode of Payment" value={profile?.contractPreferences?.paymentPreference} section="contractPreferences" field="paymentPreference" type="select" options={['Bank Transfer', 'UPI', 'Cash']} />
                                        <DataRow label="Preferred Crops" value={profile?.contractPreferences?.preferredCrops} section="contractPreferences" field="preferredCrops" type="array" fullWidth />
                                    </div>

                                    {/* B. KYC */}
                                    <SectionTitle icon={Shield} title="KYC & Financials" />
                                    <div className="grid grid-cols-1 md:grid-cols-2">
                                        <DataRow label="Aadhaar No." value={profile?.kyc?.aadhaarNumber ? `XXXX-XXXX-${profile.kyc.aadhaarNumber.slice(-4)}` : ''} section="kyc" field="aadhaarNumber" />
                                        <DataRow label="PAN No." value={profile?.kyc?.panNumber} section="kyc" field="panNumber" />
                                        <DataRow label="KCC Card No." value={profile?.kyc?.kccNumber} section="kyc" field="kccNumber" />
                                        <DataRow label="Bank Account" value={profile?.kyc?.bankDetails?.accountNumber} />
                                        <DataRow label="IFSC Code" value={profile?.kyc?.bankDetails?.ifscCode} />
                                        <DataRow label="Bank Name" value={profile?.kyc?.bankDetails?.bankName} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Buyer View - Comprehensive */}
                                    {/* A. Company Details */}
                                    <SectionTitle icon={Building2} title="Organization Profile" />
                                    <div className="grid grid-cols-1 md:grid-cols-2">
                                        <DataRow label="Company Name" value={profile?.companyDetails?.companyName} section="companyDetails" field="companyName" />
                                        <DataRow label="Company Type" value={profile?.companyDetails?.companyType} section="companyDetails" field="companyType" type="select" options={['Food Processing', 'Exporter', 'Retail', 'Manufacturer']} />
                                        <DataRow label="CIN / Reg No." value={profile?.companyDetails?.cin} section="companyDetails" field="cin" />
                                        <DataRow label="GST Number" value={profile?.companyDetails?.gstNumber} section="companyDetails" field="gstNumber" />
                                        <DataRow label="PAN Number" value={profile?.companyDetails?.panNumber} section="companyDetails" field="panNumber" />
                                        <DataRow label="Website" value={profile?.website} />
                                    </div>

                                    {/* B. Address */}
                                    <SectionTitle icon={MapPin} title="Registered Office" />
                                    <div className="grid grid-cols-1 md:grid-cols-2">
                                        <DataRow label="Head Office Address" value={profile?.address?.headOffice} section="address" field="headOffice" fullWidth />
                                        <DataRow label="State" value={profile?.address?.state} section="address" field="state" />
                                        <DataRow label="District" value={profile?.address?.district} section="address" field="district" />
                                        <DataRow label="Pincode" value={profile?.address?.pincode} section="address" field="pincode" />
                                    </div>

                                    {/* C. Auth Person */}
                                    <SectionTitle icon={User} title="Authorized Representative" />
                                    <div className="grid grid-cols-1 md:grid-cols-2">
                                        <DataRow label="Full Name" value={profile?.authPerson?.name} section="authPerson" field="name" />
                                        <DataRow label="Designation" value={profile?.authPerson?.designation} section="authPerson" field="designation" />
                                        <DataRow label="Official Email" value={profile?.authPerson?.email} section="authPerson" field="email" />
                                        <DataRow label="Direct Phone" value={profile?.authPerson?.phone} section="authPerson" field="phone" />
                                    </div>

                                    {/* D. Requirements */}
                                    <SectionTitle icon={Sprout} title="Procurement Requirements" />
                                    <div className="grid grid-cols-1 md:grid-cols-2">
                                        <DataRow label="Crops Required" value={profile?.requirements?.cropTypes} section="requirements" field="cropTypes" type="array" fullWidth />
                                        <DataRow label="Volume / Season (MT)" value={profile?.requirements?.quantityPerSeason} section="requirements" field="quantityPerSeason" type="number" />
                                        <DataRow label="Quality Standards" value={profile?.requirements?.qualityStandards} section="requirements" field="qualityStandards" fullWidth />
                                        <DataRow label="Budget Min" value={profile?.requirements?.budgetRange?.min} section="requirements" field="budgetRange.min" type="number" />
                                        <DataRow label="Budget Max" value={profile?.requirements?.budgetRange?.max} section="requirements" field="budgetRange.max" type="number" />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </ProfileContext.Provider>
    );
};

export default Profile;
