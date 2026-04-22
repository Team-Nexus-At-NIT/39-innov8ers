import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Unlock, AlertTriangle, ArrowRight, IndianRupee } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

const EscrowDashboard = ({ contract, onEscrowUpdate }) => {
    const { user } = useAuth();
    const role = (user?.role || '').toLowerCase() === 'farmer' ? 'farmer' : 'buyer';
    const [loading, setLoading] = useState(false);
    const [amountToFund, setAmountToFund] = useState('');
    const escrow = contract.escrow || { totalFunded: 0, totalReleased: 0, lockedBalance: 0, status: 'Pending Funding' };

    useEffect(() => {
        // Load Razorpay dynamically
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const totalAmount = (contract.pricingTerms?.pricePerUnit * contract.cropDetails?.quantity) || 1;
    const pendingFunding = Math.max(0, totalAmount - escrow.totalFunded);
    const fundingProgress = Math.min(100, Math.round((escrow.totalFunded / totalAmount) * 100));

    let nextStageAmount = 0;
    let nextStageName = '';
    
    if (escrow.totalFunded < totalAmount * 0.39) { // Using 0.39 to avoid float issues
        nextStageAmount = Math.round(totalAmount * 0.40);
        nextStageName = 'Sowing (40%)';
    } else if (escrow.totalFunded < totalAmount * 0.69) {
        nextStageAmount = Math.round(totalAmount * 0.30);
        nextStageName = 'Mid-Season (30%)';
    } else if (escrow.totalFunded < totalAmount * 0.99) {
        nextStageAmount = Math.round(totalAmount * 0.30);
        nextStageName = 'Harvest (30%)';
    }

    const handleFundEscrow = async (exactAmount) => {
        if (!exactAmount || Number(exactAmount) <= 0) {
            toast.error('Invalid funding amount');
            return;
        }

        setLoading(true);
        try {
            // STEP 1: Generate Secure Order on Backend
            const { data } = await api.post(`/escrow/create-order`, { 
                amount: Number(exactAmount),
                contractId: contract._id 
            });
            const order = data.data;

            // STEP 2: Configure Razorpay Options
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SbM4miZRaIvawW',
                amount: order.amount,
                currency: order.currency,
                name: 'Kisan Bandhu Escrow',
                description: `Funding for Phase: ${nextStageName}`,
                order_id: order.id,
                theme: { color: '#0f172a' },
                prefill: {
                    name: user?.name || 'Buyer',
                    email: user?.email || '',
                },
                handler: async function (response) {
                    try {
                        const verifyRes = await api.post('/escrow/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            contractId: contract._id,
                            amount: exactAmount
                        });

                        if (verifyRes.data.success) {
                            toast.success(`Successfully securely funded ₹${exactAmount.toLocaleString()} into Platform Escrow`);
                            if (onEscrowUpdate) onEscrowUpdate(verifyRes.data.data.contract);
                        }
                    } catch (err) {
                        toast.error(err.response?.data?.error || 'Payment verification failed. Please contact support.');
                    }
                }
            };

            // STEP 3: Initialise Razorpay Modal
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                toast.error(response.error.description || 'Payment Gateway Failed');
            });
            rzp.open();
            
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Failed to securely connect to payment gateway');
        } finally {
            setLoading(false); // Modal holds its own state now
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="text-emerald-400 w-5 h-5" />
                    <h3 className="text-white font-bold text-sm tracking-wide uppercase">Platform Escrow System</h3>
                </div>
                <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider border whitespace-nowrap ${
                    escrow.status === 'Funded' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                    escrow.status === 'Partially Funded' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                    'bg-slate-700 text-slate-300 border-slate-600'
                }`}>
                    {escrow.status}
                </span>
            </div>

            <div className="p-6">
                <div className="flex justify-between items-end mb-2">
                    <div className="text-sm font-bold text-gray-700 uppercase tracking-wide">Funding Pipeline</div>
                    <div className="text-xs font-bold text-gray-500">{fundingProgress}% Secured</div>
                </div>
                
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-6 flex">
                    {/* Locked Balance Segment */}
                    <div 
                        className="bg-amber-400 h-full transition-all duration-700 border-r border-white" 
                        style={{ width: `${(escrow.lockedBalance / totalAmount) * 100}%` }}
                        title="Locked Balance"
                    ></div>
                    {/* Released Balance Segment */}
                    <div 
                        className="bg-emerald-500 h-full transition-all duration-700" 
                        style={{ width: `${(escrow.totalReleased / totalAmount) * 100}%` }}
                        title="Released Balance"
                    ></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Total Value</p>
                        <p className="font-black text-slate-800">₹{totalAmount.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                        <p className="text-[10px] uppercase font-bold text-amber-600 flex items-center mb-1"><Lock className="w-3 h-3 mr-1"/> Locked Funds</p>
                        <p className="font-black text-amber-800">₹{escrow.lockedBalance.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                        <p className="text-[10px] uppercase font-bold text-emerald-600 flex items-center mb-1"><Unlock className="w-3 h-3 mr-1"/> Released</p>
                        <p className="font-black text-emerald-800">₹{escrow.totalReleased.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                        <p className="text-[10px] uppercase font-bold text-red-600 flex items-center mb-1"><AlertTriangle className="w-3 h-3 mr-1"/> Pending</p>
                        <p className="font-black text-red-800">₹{pendingFunding.toLocaleString()}</p>
                    </div>
                </div>

                {role === 'buyer' && pendingFunding > 0 && nextStageAmount > 0 && (
                    <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 flex flex-col sm:flex-row items-center gap-3">
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-blue-900 mb-1">Fund Next Stage</h4>
                            <p className="text-xs text-blue-700">Ensure funds are in escrow so the farmer can begin the {nextStageName.split(' ')[0]} phase.</p>
                        </div>
                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-center flex items-center justify-center">
                                 <IndianRupee className="w-3 h-3 mr-1"/> Next: {nextStageName}
                            </span>
                            <button 
                                onClick={() => handleFundEscrow(nextStageAmount)}
                                disabled={loading}
                                className="bg-blue-600 text-white px-5 py-2.5 rounded-md text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50 whitespace-nowrap shadow-sm"
                            >
                                {loading ? 'Processing...' : `Deposit ₹${nextStageAmount.toLocaleString()}`}
                            </button>
                        </div>
                    </div>
                )}
                
                {role === 'farmer' && escrow.lockedBalance === 0 && contract.status !== 'Completed' && (
                    <div className="bg-red-50 border border-red-100 text-red-800 p-3 rounded-lg text-sm font-medium flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                            <strong>Pending Funding:</strong> Do not begin the next stage until the required funds are locked in the Platform Escrow. 
                            If the company fails to fund, the contract is at risk.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EscrowDashboard;
