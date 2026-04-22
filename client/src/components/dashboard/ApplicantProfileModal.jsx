import { X, User, MapPin, Phone, Mail, Tractor, Shield, FileText, Sprout, Building2, Download } from 'lucide-react';
import { cn } from '../../lib/utils';

const ApplicantProfileModal = ({ isOpen, onClose, profile, loading }) => {
    if (!isOpen) return null;

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
                <div className="bg-white/90 p-8 rounded-2xl shadow-2xl flex flex-col items-center border border-white/20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-emerald-500 mb-4"></div>
                    <p className="text-gray-800 font-bold tracking-wide">Fetching Profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    const { user, isBasic } = profile;
    const isFarmer = user.role === 'farmer';

    // Modern Color Palette
    const gradient = isFarmer
        ? "bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700"
        : "bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800";

    const iconColor = isFarmer ? "text-emerald-600" : "text-indigo-600";
    const bgColor = isFarmer ? "bg-emerald-50" : "bg-indigo-50";
    const borderColor = isFarmer ? "border-emerald-100" : "border-indigo-100";

    // Helper for rendering info cards
    const InfoCard = ({ label, value, icon: Icon, fullWidth = false }) => (
        <div className={`p-4 rounded-xl border ${borderColor} ${bgColor} ${fullWidth ? 'col-span-2' : ''} hover:shadow-md transition-all duration-300 group`}>
            <div className="flex items-start">
                <div className={`p-2 rounded-lg bg-white shadow-sm mr-3 group-hover:scale-110 transition-transform`}>
                    {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}
                </div>
                <div>
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 opacity-80">{label}</h4>
                    <p className="text-sm font-bold text-gray-800 break-words leading-snug">
                        {Array.isArray(value) ? value.join(', ') : value || <span className="text-gray-400 font-normal italic">Not Specified</span>}
                    </p>
                </div>
            </div>
        </div>
    );

    const SectionTitle = ({ title }) => (
        <div className="flex items-center space-x-2 mb-4 mt-6 first:mt-0">
            <div className={`h-6 w-1 rounded-full ${isFarmer ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>
            <h3 className="text-lg font-bold text-gray-800 tracking-tight">{title}</h3>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-300 border border-white/20">

                {/* Modern Header */}
                <div className={`${gradient} p-8 text-white relative flex-shrink-0 overflow-hidden`}>
                    {/* Abstract decorative circles */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-10 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-black/20 hover:bg-black/30 text-white rounded-full p-2 transition backdrop-blur-md"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6 relative z-10">
                        <div className="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center transform rotate-3 hover:rotate-0 transition-all duration-300">
                            <span className={`text-4xl font-black ${isFarmer ? 'text-emerald-600' : 'text-indigo-600'}`}>
                                {user.name?.charAt(0) || 'U'}
                            </span>
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h2 className="text-3xl font-black tracking-tight mb-1">{user.name}</h2>
                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 opacity-90 text-sm font-medium">
                                <span className="bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm flex items-center">
                                    <User className="w-3.5 h-3.5 mr-1.5" />
                                    {isFarmer ? 'Verified Farmer' : 'Registered Buyer'}
                                </span>
                                <span className="flex items-center">
                                    <MapPin className="w-3.5 h-3.5 mr-1.5" />
                                    {isBasic ? 'Location Hidden' :
                                        isFarmer ? `${profile.location?.village || ''}, ${profile.location?.district || ''}`
                                            : `${profile.address?.district || ''}`}
                                </span>

                                {/* New Rating Badge */}
                                <span className={`flex items-center bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold ${profile.trustMetrics?.avgRating > 0 ? 'text-yellow-300' : 'text-white/70'}`}>
                                    <span className="mr-1">★</span>
                                    {profile.trustMetrics?.avgRating ? profile.trustMetrics.avgRating.toFixed(1) : 'New'}
                                    <span className="ml-1 text-[10px] opacity-75">({profile.trustMetrics?.reviewCount || 0})</span>
                                </span>
                            </div>
                        </div>
                        {/* Action Buttons could go here */}
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto p-8 flex-1 bg-white">
                    {isBasic ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                            <div className="bg-gray-50 p-6 rounded-full mb-4">
                                <User className="w-16 h-16 text-gray-300" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Profile Incomplete</h3>
                            <p className="max-w-md mx-auto mb-8">This user has not provided detailed profile information yet.</p>

                            <div className="grid grid-cols-1 gap-4 w-full max-w-md">
                                <InfoCard label="Email Address" value={user.email} icon={Mail} />
                                <InfoCard label="Phone Number" value={user.phone} icon={Phone} />
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-8 animate-in slide-in-from-bottom-4 duration-500 delay-100">

                            {/* Section 1: Contact */}
                            <div>
                                <SectionTitle title="Contact Information" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InfoCard label="Phone Number" value={user.phone} icon={Phone} />
                                    <InfoCard label="Email Address" value={user.email} icon={Mail} />
                                </div>
                            </div>

                            {/* Section 2: Role Specifics */}
                            {isFarmer ? (
                                <>
                                    <div>
                                        <SectionTitle title="Farming Profile" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InfoCard label="Total Land Area" value={profile.landDetails?.totalLandArea ? `${profile.landDetails.totalLandArea} Acres` : null} icon={MapPin} />
                                            <InfoCard label="Irrigation Source" value={profile.landDetails?.irrigationSource} icon={Sprout} />
                                            <InfoCard label="Experience" value={profile.cropDetails?.experienceYears ? `${profile.cropDetails.experienceYears} Years` : null} icon={User} />
                                            <InfoCard label="Primary Crops" value={profile.cropDetails?.primaryCrops} icon={Tractor} />
                                        </div>
                                    </div>

                                    <div>
                                        <SectionTitle title="Contract Preferences" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InfoCard label="Preferred Crops" value={profile.contractPreferences?.preferredCrops} icon={FileText} />
                                            <InfoCard label="Contract Duration" value={profile.contractPreferences?.preferredDuration} icon={Clock} />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <SectionTitle title="Company Details" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InfoCard label="Company Type" value={profile.companyDetails?.companyType} icon={Building2} />
                                            <InfoCard label="GST Number" value={profile.companyDetails?.gstNumber} icon={FileText} />
                                            <InfoCard label="Head Office" value={profile.address?.headOffice} fullWidth icon={MapPin} />
                                        </div>
                                    </div>
                                    <div>
                                        <SectionTitle title="Sourcing Requirements" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InfoCard label="Crops Needed" value={profile.requirements?.cropTypes} fullWidth icon={Sprout} />
                                            <InfoCard label="Quality Standards" value={profile.requirements?.qualityStandards} fullWidth icon={Shield} />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Modern Footer */}
                <div className="bg-gray-50/80 backdrop-blur p-6 border-t border-gray-100 flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        Close
                    </button>
                    <button className={`px-6 py-2.5 rounded-xl font-bold text-white shadow-lg transform hover:scale-105 transition-all ${isFarmer ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                        <span className="flex items-center">
                            <Download className="w-4 h-4 mr-2" />
                            Download Profile
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper Icon for clock not imported in original set
import { Clock } from 'lucide-react';

export default ApplicantProfileModal;
