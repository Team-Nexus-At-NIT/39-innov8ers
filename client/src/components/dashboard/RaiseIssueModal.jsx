import React, { useState } from 'react';
import { X, AlertTriangle, Send, ShieldAlert } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

const RaiseIssueModal = ({ isOpen, onClose, contractId }) => {
    const [formData, setFormData] = useState({
        reason: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.reason || !formData.description) return toast.error('Please fill all fields');

        setLoading(true);
        try {
            const { data } = await api.post('/disputes', {
                contract: contractId,
                reason: formData.reason,
                description: formData.description
            });

            if (data.success) {
                toast.success('Issue reported to Admin successfully');
                onClose();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to report issue');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-red-100">
                {/* Header */}
                <div className="bg-red-50 p-6 border-b border-red-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-100 rounded-xl">
                            <ShieldAlert className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Report Contract Issue</h3>
                            <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mt-0.5">Admin Mediation Portal</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-red-100 rounded-full transition-colors text-red-400 hover:text-red-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-4">
                        <AlertTriangle className="w-10 h-10 text-amber-500 shrink-0" />
                        <p className="text-xs text-amber-800 font-medium leading-relaxed">
                            Reporting an issue will notify the Platform Admin. Please provide accurate details. Improper or fake reports may lead to account penalties.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Issue Category / Title</label>
                            <input
                                type="text"
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                placeholder="e.g., Payment Delay, Quality Dispute..."
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all font-bold text-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Detailed Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Provide as much detail as possible to help the Admin resolve this fairly..."
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all font-medium text-sm min-h-[120px]"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-gray-200 rounded-xl font-black text-[10px] uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] py-3 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-red-700 hover:shadow-red-200 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <span className="animate-pulse">Submitting...</span>
                            ) : (
                                <>
                                    <Send className="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    Submit to Admin
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RaiseIssueModal;
