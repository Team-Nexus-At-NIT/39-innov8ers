import { ShieldAlert, Clock, CheckCircle2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const VerificationPending = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                {/* Header Pattern */}
                <div className="h-32 bg-gradient-to-r from-amber-500 to-orange-600 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg">
                            <Clock className="w-10 h-10 text-amber-500 animate-pulse" />
                        </div>
                    </div>
                </div>

                <div className="pt-14 pb-8 px-8 text-center">
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Verification Pending</h2>
                    <p className="text-gray-500 mb-6">
                        Hello <span className="font-bold text-gray-800">{user?.name}</span>, your account is currently under review.
                    </p>

                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-8 text-left">
                        <h4 className="font-bold text-amber-800 mb-2 flex items-center">
                            <ShieldAlert className="w-4 h-4 mr-2" />
                            Why am I seeing this?
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            To ensure the safety and authenticity of our platform, all Farmer and Buyer profiles must be verified by an administrator before accessing the dashboard.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span>Profile Submitted</span>
                            <span className="w-8 h-px bg-gray-300"></span>
                            <Clock className="w-4 h-4 text-amber-500" />
                            <span className="font-bold text-amber-600">Pending Review</span>
                            <span className="w-8 h-px bg-gray-300"></span>
                            <span className="w-4 h-4 border-2 border-gray-200 rounded-full"></span>
                            <span>Approved</span>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t">
                        <button
                            onClick={() => { logout(); navigate('/'); }}
                            className="flex items-center justify-center w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                        >
                            <LogOut className="w-4 h-4 mr-2" /> Sign Out & Check Later
                        </button>
                        <p className="mt-4 text-xs text-gray-400">
                            You will be notified once your account is approved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationPending;
