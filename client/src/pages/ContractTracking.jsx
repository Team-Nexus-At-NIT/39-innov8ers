import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { CheckCircle, Clock, Truck, FileText, Camera, DollarSign, MapPin } from 'lucide-react';

const ContractTracking = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);

    // Socket Connection
    useEffect(() => {
        const socket = io();
        socket.emit('join_contract', id);

        socket.on('contract_updated', (updatedContract) => {
            if (updatedContract._id === id) {
                setContract(updatedContract);
                toast('Contract Status Updated!', { icon: '🔔' });
            }
        });

        return () => socket.disconnect();
    }, [id]);

    useEffect(() => {
        fetchContract();
    }, [id]);

    const fetchContract = async () => {
        try {
            const { data } = await api.get(`/contracts/${id}`);
            setContract(data.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load contract');
            setLoading(false);
        }
    };

    const updateStage = async (newStage, percentage) => {
        try {
            await api.put(`/contracts/${id}/fulfillment`, {
                stage: newStage,
                percentage,
                timelineEvent: {
                    stage: newStage,
                    status: 'Completed',
                    remarks: `Marked as ${newStage} by ${user.name}`
                }
            });
            toast.success(`Stage updated to ${newStage}`);
        } catch (error) {
            toast.error('Update failed');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Tracking Details...</div>;
    if (!contract) return <div className="p-8 text-center">Contract not found</div>;

    const stages = ['Sowing', 'Mid-Season', 'Harvest', 'Inspection', 'Ready for Pickup', 'In Transit', 'Delivered', 'Completed'];
    const currentStageIndex = stages.indexOf(contract.fulfillment?.currentStage);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-8 border-green-600">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Contract #{contract._id.slice(-6).toUpperCase()}</h1>
                        <p className="text-gray-500 mt-1">
                            {contract.cropDetails?.cropName} • {contract.cropDetails?.quantity} Tons • ₹{contract.pricingTerms?.pricePerUnit}/Qtl
                        </p>
                    </div>
                    <div className="text-right">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide ${contract.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                            {contract.status}
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-8 relative">
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                        <div style={{ width: `${contract.fulfillment?.percentage || 0}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-1000"></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 font-medium">
                        {stages.map((stage, idx) => (
                            <div key={idx} className={`${idx <= currentStageIndex ? 'text-green-600 font-bold' : ''}`}>
                                {stage}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Left: Action Center */}
                <div className="md:col-span-2 space-y-8">

                    {/* 1. Milestone Tracking */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center"><Clock className="w-5 h-5 mr-2 text-blue-600" /> Live Timeline</h3>
                        <div className="space-y-6 border-l-2 border-gray-200 ml-3 pl-6 relative">
                            {contract.fulfillment?.timeline?.map((event, idx) => (
                                <div key={idx} className="relative">
                                    <span className="absolute -left-[33px] bg-green-500 h-4 w-4 rounded-full border-2 border-white"></span>
                                    <div className="flex justify-between">
                                        <h4 className="font-bold text-gray-800">{event.stage}</h4>
                                        <span className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">{event.remarks}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. Actions (Context Sensitive) */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center"><CheckCircle className="w-5 h-5 mr-2 text-green-600" /> Pending Actions</h3>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Farmer Actions */}
                            {user.role === 'farmer' && (
                                <>
                                    <button onClick={() => updateStage('Sowing', 20)} className="btn-action bg-yellow-50 border-yellow-200 hover:bg-yellow-100">
                                        🌱 Mark Sowing Complete
                                    </button>
                                    <button onClick={() => updateStage('Harvest', 60)} className="btn-action bg-orange-50 border-orange-200 hover:bg-orange-100">
                                        🌾 Mark Harvest Complete
                                    </button>
                                </>
                            )}

                            {/* Buyer Actions */}
                            {user.role === 'buyer' && (
                                <>
                                    <button onClick={() => updateStage('Inspection', 80)} className="btn-action bg-blue-50 border-blue-200 hover:bg-blue-100">
                                        🔍 Pass Quality Inspection
                                    </button>
                                    <button onClick={() => updateStage('Completed', 100)} className="btn-action bg-green-50 border-green-200 hover:bg-green-100">
                                        ✅ Mark Contract Completed
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* 3. Proof Uploads */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center"><Camera className="w-5 h-5 mr-2 text-purple-600" /> Documentation & Proofs</h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition cursor-pointer">
                            <p className="text-gray-500">Click to upload Crop Images, Lab Reports, or Receipts</p>
                            <button className="mt-2 px-4 py-2 bg-gray-800 text-white rounded text-sm">Upload File</button>
                        </div>
                    </div>
                </div>

                {/* Right: Info Panels */}
                <div className="space-y-6">
                    {/* Payment Status */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center"><DollarSign className="w-5 h-5 mr-2 text-green-600" /> Payment Tracker</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Total Amount</span>
                                <span className="font-bold">₹{contract.fulfillment?.payments?.totalAmount || '0'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Paid So Far</span>
                                <span className="font-bold text-green-600">₹{contract.fulfillment?.payments?.totalPaid || '0'}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                            </div>
                            <button className="w-full mt-4 py-2 bg-green-600 text-white rounded font-bold text-sm">View Transaction Logs</button>
                        </div>
                    </div>

                    {/* Logistics Status */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center"><Truck className="w-5 h-5 mr-2 text-blue-600" /> Logistics Status</h3>
                        <div className="text-sm space-y-2">
                            <p><span className="font-bold">Status:</span> {contract.fulfillment?.logistics?.status || 'Not Started'}</p>
                            <p><span className="font-bold">Partner:</span> {contract.fulfillment?.logistics?.partnerName || 'Pending Assignment'}</p>
                            <button className="text-blue-600 font-bold flex items-center mt-2"><MapPin className="w-4 h-4 mr-1" /> Track Live GPS</button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .btn-action { @apply w-full py-4 rounded-lg font-bold text-gray-700 border transition shadow-sm text-left px-4 flex items-center; }
            `}</style>
        </div>
    );
};

export default ContractTracking;
