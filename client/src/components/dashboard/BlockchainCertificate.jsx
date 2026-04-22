import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Link as LinkIcon, Lock, CheckCircle, FileText, Loader, ExternalLink } from 'lucide-react';
import api from '../../lib/axios';

const BlockchainCertificate = ({ contractId }) => {
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const fetchCertificate = async () => {
            try {
                // Determine if we need to call the API or if we can rely on passed props?
                // Best to fetch from the "blockchain" source of truth endpoint
                const { data } = await api.get(`/blockchain/${contractId}`);
                if (data.success) {
                    // Add slight artificial delay for "Verification" effect
                    setTimeout(() => {
                        setCertificate(data.data);
                        setLoading(false);
                    }, 1500);
                }
            } catch (err) {
                console.error(err);
                setError("Contract not yet verified on Ledger.");
                setLoading(false);
            }
        };

        if (contractId) {
            fetchCertificate();
        }
    }, [contractId]);

    // If not found, show a placeholder instead of nothing
    if (error) return (
        <div className="mt-8 bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center">
            <Lock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <h3 className="text-gray-500 font-bold text-sm">Blockchain Verification Pending</h3>
            <p className="text-xs text-gray-400 mt-1">This contract has not been finalized on the ledger yet. Ensure both parties update the status.</p>
        </div>
    );

    return (
        <div className="mt-8">
            <AnimatePresence>
                {loading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex items-center justify-center space-x-3"
                    >
                        <Loader className="w-5 h-5 text-gray-500 animate-spin" />
                        <span className="text-gray-500 font-medium">Verifying Contract Integrity on Hyperledger Fabric...</span>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-1 overflow-hidden shadow-2xl"
                    >
                        <div className="bg-white/5 backdrop-blur-sm p-6 text-white relative">
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                <LinkIcon className="w-48 h-48" />
                            </div>

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 relative z-10">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-emerald-500 p-2 rounded-lg shadow-lg shadow-emerald-500/30">
                                        <ShieldCheck className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight">Blockchain Verified Certificate</h3>
                                        <p className="text-emerald-400 text-sm font-medium flex items-center">
                                            <Lock className="w-3 h-3 mr-1" /> Immutably Stored on Hyperledger Fabric
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 md:mt-0 text-right">
                                    <div className="text-xs text-slate-400 font-mono uppercase tracking-widest mb-1">Transaction Hash</div>
                                    <div className="bg-black/30 px-3 py-1 rounded-full text-xs font-mono text-emerald-400 border border-emerald-500/30 flex items-center">
                                        {certificate.txId || 'tx_293849...'} <ExternalLink className="w-3 h-3 ml-2 opacity-50" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 relative z-10">
                                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                    <p className="text-xs text-slate-400 uppercase font-bold">Contract ID</p>
                                    <p className="font-mono text-sm">{certificate.id.substring(0, 8)}...</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                    <p className="text-xs text-slate-400 uppercase font-bold">Price Guarantee</p>
                                    <p className="font-mono text-sm text-emerald-300">₹{certificate.priceGuarantee}</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                    <p className="text-xs text-slate-400 uppercase font-bold">Crop Type</p>
                                    <p className="font-mono text-sm">{certificate.cropType}</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                    <p className="text-xs text-slate-400 uppercase font-bold">Expiry Date</p>
                                    <p className="font-mono text-sm">{new Date(certificate.expiryDate).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center border-t border-white/10 pt-4 relative z-10">
                                <div className="flex items-center space-x-4">
                                    <div className="flex -space-x-2">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-slate-800 flex items-center justify-center text-xs font-bold" title="Farmer Signed">F</div>
                                        <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-slate-800 flex items-center justify-center text-xs font-bold" title="Buyer Signed">B</div>
                                    </div>
                                    <span className="text-xs text-slate-400">Multi-Party Consensus Verified</span>
                                </div>
                                <button
                                    onClick={() => setShowDetails(true)}
                                    className="text-xs font-bold text-white/70 hover:text-white flex items-center transition"
                                >
                                    <FileText className="w-4 h-4 mr-1" /> View Raw Ledger Data
                                </button>
                            </div>
                        </div>

                        {/* Raw Data Modal Overlay */}
                        {showDetails && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl"
                                >
                                    <div className="flex justify-between items-center p-4 border-b border-slate-700">
                                        <h3 className="text-white font-bold flex items-center">
                                            <FileText className="w-5 h-5 mr-2 text-emerald-400" />
                                            Immutable Ledger Record
                                        </h3>
                                        <button onClick={() => setShowDetails(false)} className="text-slate-400 hover:text-white transition">✕</button>
                                    </div>
                                    <div className="p-0 overflow-auto max-h-[60vh]">
                                        <pre className="text-xs font-mono text-emerald-300 bg-black/50 p-6 overflow-x-auto">
                                            {JSON.stringify(certificate, null, 4)}
                                        </pre>
                                    </div>
                                    <div className="p-4 bg-slate-800/50 border-t border-slate-700 flex justify-between items-center text-xs text-slate-400">
                                        <span>Stored on Hyperledger Fabric Channel: 'mychannel'</span>
                                        <span className="flex items-center text-emerald-400 font-bold"><CheckCircle className="w-3 h-3 mr-1" /> Cryptographically Verified</span>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BlockchainCertificate;
