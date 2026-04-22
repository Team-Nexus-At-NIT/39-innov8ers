import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { User, MapPin, Star, MessageSquare, CheckCircle, Shield, Award, Calendar, FileText, AlertCircle, Info } from 'lucide-react';
import { format } from 'date-fns';

const PublicProfile = () => {
    const { userId } = useParams();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ avgRating: 0, totalReviews: 0 });

    // Review Form State
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', contractId: '' });
    const [eligibleContracts, setEligibleContracts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Profile
                const profileRes = await api.get(`/profiles/user/${userId}`);
                setProfile(profileRes.data.data);

                // 2. Fetch Reviews
                const reviewsRes = await api.get(`/reviews/user/${userId}`);
                setReviews(reviewsRes.data.data);

                // Calculate Stats locally or use from DB if updated
                const avg = reviewsRes.data.data.reduce((acc, curr) => acc + curr.rating, 0) / (reviewsRes.data.data.length || 1);
                setStats({
                    avgRating: avg || 0,
                    totalReviews: reviewsRes.data.data.length
                });

            } catch (error) {
                console.error("Failed to fetch public profile", error);
                // toast.error("User not found");
                // navigate('/dashboard'); // Removed auto-redirect for debugging
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userId, navigate]);

    // Real-time Stats Recalculation
    useEffect(() => {
        if (reviews.length >= 0) {
            const total = reviews.length;
            const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
            const avg = total > 0 ? (sum / total) : 0;

            setStats({
                avgRating: avg,
                totalReviews: total
            });
        }
    }, [reviews]);

    // Check eligibility when Modal opens
    const handleOpenReview = async () => {
        try {
            const { data } = await api.get('/contracts'); // Get MY contracts
            if (data.success) {
                // Filter: Completed AND (Buyer or Farmer matches userId)
                const completed = data.data.filter(c =>
                    (c.status === 'Completed' || c.status === 'Fulfilled' || c.status === 'Active') && // Allowing Active for Demo
                    (c.buyer._id === userId || c.farmer._id === userId)
                );

                if (completed.length === 0) {
                    toast.error("You must have a completed contract with this user to review them.");
                    return;
                }
                setEligibleContracts(completed);
                setShowReviewModal(true);
            }
        } catch (err) {
            console.error(err);
            toast.error("Could not verify eligibility");
        }
    };

    const submitReview = async () => {
        if (!reviewForm.contractId) {
            // select first if only one
            if (eligibleContracts.length > 0) reviewForm.contractId = eligibleContracts[0]._id;
            else return toast.error("Please select a contract");
        }

        try {
            const res = await api.post('/reviews', {
                revieweeId: userId,
                contractId: reviewForm.contractId,
                rating: reviewForm.rating,
                comment: reviewForm.comment
            });
            if (res.data.success) {
                toast.success("Review Submitted!");
                setShowReviewModal(false);
                // Refresh reviews
                const reviewsRes = await api.get(`/reviews/user/${userId}`);
                setReviews(reviewsRes.data.data);
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to submit review");
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>;

    if (!profile) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
                <p className="text-gray-500 mb-6">The user profile you are looking for does not existence or has been removed.</p>
                <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold">Return to Dashboard</button>
            </div>
        </div>
    );

    const isOwnProfile = currentUser && currentUser.id === userId;
    // Handle different profile structures (user object vs minimal)
    const userData = profile.user || profile;
    const isFarmer = userData.role === 'farmer';
    const themeColor = isFarmer ? 'emerald' : 'blue';

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto">

                {/* Header Profile Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8 border border-gray-100 group/profile">
                    <div className="h-48 relative overflow-hidden">
                        {/* Hero Image */}
                        <img 
                            src="/market-bg.jpg" 
                            alt="Harvest" 
                            className="absolute inset-0 w-full h-full object-cover group-hover/profile:scale-105 transition-transform duration-1000" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        
                        <div className="absolute -bottom-1 left-8 flex items-end translate-y-1/2 z-10">
                            <div className="w-32 h-32 rounded-3xl border-4 border-white bg-white shadow-2xl flex items-center justify-center overflow-hidden transform group-hover/profile:rotate-1 transition-transform">
                                <User className={`w-16 h-16 text-${themeColor}-600/30`} />
                            </div>
                        </div>
                    </div>
                    <div className="pt-20 pb-8 px-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center uppercase italic">
                                    {userData.name}
                                    {profile.kyc?.verificationStatus === 'Verified' && <CheckCircle className="w-7 h-7 text-blue-500 ml-3 fill-current" />}
                                </h1>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.3em] mt-2 flex items-center">
                                    <Shield className="w-4 h-4 mr-2 text-emerald-500" />
                                    {isFarmer ? 'Verified Farmer' : 'Verified Buyer'} • {profile.location?.state || 'India'}
                                </p>
                            </div>
 
                            {/* Reputation Score Big Badge */}
                            <div className="relative group/stats overflow-hidden bg-white p-5 rounded-3xl border-2 border-gray-50 shadow-xl flex items-center gap-6 transition-all hover:border-emerald-100">
                                <div className="text-center">
                                    <div className="text-5xl font-black text-gray-900 flex items-center justify-center">
                                        {stats.avgRating.toFixed(1)} 
                                        <Star className="w-8 h-8 text-yellow-400 fill-current ml-2 animate-pulse" />
                                    </div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Verified Rating</p>
                                </div>
                                <div className="w-px h-12 bg-gray-100" />
                                <div>
                                    <p className="text-2xl font-black text-gray-800">{stats.totalReviews}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Client Feedback</p>
                                </div>
                            </div>
                        </div>


                        {/* Action Bar */}
                        <div className="mt-8 flex space-x-4 border-t border-gray-100 pt-6">
                            {!isOwnProfile && (
                                <button
                                    onClick={handleOpenReview}
                                    className="flex items-center px-6 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                                >
                                    <Star className="w-4 h-4 mr-2" /> Write a Review
                                </button>
                            )}
                            <button className="flex items-center px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all">
                                <MessageSquare className="w-4 h-4 mr-2" /> Contact
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">                    {/* Left: Reputation Details */}
                    <div className="space-y-6">
                        <div className="bg-white p-7 rounded-3xl shadow-sm border border-gray-50 relative overflow-hidden">
                            {/* Decorative element */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 rounded-full translate-x-12 -translate-y-12 blur-2xl" />

                            <h3 className="font-black text-gray-900 flex items-center mb-6 uppercase tracking-wider text-sm italic relative z-10">
                                <Shield className="w-5 h-5 mr-3 text-emerald-500" /> Trust Indicators
                            </h3>
                            
                            <div className="space-y-5 relative z-10">
                                <div className="p-4 bg-emerald-50/30 rounded-2xl border border-emerald-50">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">KYC Status</span>
                                        <div className="flex items-center text-[10px] font-black text-white bg-emerald-500 px-2 py-0.5 rounded-md shadow-sm">
                                            <CheckCircle className="w-3 h-3 mr-1" /> VERIFIED
                                        </div>
                                    </div>
                                    <div className="w-full bg-emerald-100 h-1.5 rounded-full mt-2">
                                        <div className="bg-emerald-500 h-full rounded-full w-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                    </div>
                                </div>

                                <div className="space-y-4 px-1">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                            <span className="text-xs font-bold text-gray-500 uppercase">Platform tenure</span>
                                        </div>
                                        <span className="text-sm font-black text-gray-900">{new Date(userData.createdAt).getFullYear()}</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <CheckCircle className="w-4 h-4 text-gray-400 mr-2" />
                                            <span className="text-xs font-bold text-gray-500 uppercase">Settled Deals</span>
                                        </div>
                                        <span className="text-sm font-black text-gray-900">{profile.trustMetrics?.totalContracts || 0}</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <AlertCircle className="w-4 h-4 text-gray-400 mr-2" />
                                            <span className="text-xs font-bold text-gray-500 uppercase">Conflict Rate</span>
                                        </div>
                                        <span className={`text-sm font-black ${parseInt(profile.trustMetrics?.disputeRatio) > 5 ? 'text-red-500' : 'text-emerald-600'}`}>
                                            {profile.trustMetrics?.disputeRatio || '0%'}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-4 mt-2 border-t border-gray-50">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                                        <Info className="w-3 h-3 flex-shrink-0" />
                                        <span>Data updated in real-time based on blockchain records.</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Marketplace Activity could go here */}
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight italic uppercase">Reviews & Feedback</h2>
                            <div className="h-px flex-1 bg-gray-100 mx-6 opacity-50" />
                        </div>
 
                        {reviews.length === 0 ? (
                            <div className="bg-white p-16 rounded-3xl text-center border-2 border-dashed border-gray-100 shadow-inner">
                                <Star className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No verification data yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {reviews.map(review => (
                                    <div key={review._id} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50 hover:shadow-2xl transition-all duration-500 group/card relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/30 rounded-full translate-x-16 -translate-y-16 blur-3xl group-hover/card:scale-150 transition-transform" />
                                        
                                        <div className="flex justify-between items-start mb-6 relative z-10">
                                            <div className="flex items-center">
                                                <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-green-800 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg transform -rotate-3 group-hover/card:rotate-0 transition-transform">
                                                    {review.reviewer?.name?.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <p className="font-black text-gray-900 text-lg uppercase tracking-tight">{review.reviewer?.name}</p>
                                                    <div className="flex items-center mt-0.5">
                                                        <Calendar className="w-3 h-3 text-gray-400 mr-1.5" />
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{format(new Date(review.createdAt), 'MMM dd, yyyy')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 shadow-inner scale-110">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-emerald-500 fill-current' : 'text-gray-200'}`} />
                                                ))}
                                            </div>
                                        </div>

                                        <p className="text-gray-700 text-base leading-relaxed mb-6 font-medium italic relative z-10">
                                            "{review.comment}"
                                        </p>

                                        <div className="flex items-center justify-between relative z-10 pt-4 border-t border-gray-50">
                                            <div className="flex items-center text-[10px] font-black text-emerald-600 bg-emerald-50/50 px-4 py-2 rounded-xl border border-emerald-100">
                                                <CheckCircle className="w-3.5 h-3.5 mr-2" />
                                                VERIFIED TRANSACTION: {review.contract?.cropDetails?.cropName || 'Farming Agreement'}
                                            </div>
                                            
                                            <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                Ref: #{review.contract?._id?.slice(-8) || 'TRX-N/A'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Write Review Modal */}
            {
                showReviewModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                            <h3 className="text-xl font-black text-gray-900 mb-1">Rate your experience</h3>
                            <p className="text-sm text-gray-500 mb-6">Share your feedback to help others.</p>

                            <div className="space-y-4">
                                {/* Star Rating Input */}
                                <div className="flex justify-center space-x-2 mb-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star className={`w-10 h-10 ${star <= reviewForm.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                                        </button>
                                    ))}
                                </div>

                                {/* Contract Select */}
                                {eligibleContracts.length > 1 && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Contract</label>
                                        <select
                                            className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                            onChange={(e) => setReviewForm({ ...reviewForm, contractId: e.target.value })}
                                            value={reviewForm.contractId}
                                        >
                                            <option value="">Select a verified contract...</option>
                                            {eligibleContracts.map(c => (
                                                <option key={c._id} value={c._id}>{c.cropDetails?.cropName} ({c.status})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Your Review</label>
                                    <textarea
                                        className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-32"
                                        placeholder="How was the payment? delivery? communication?"
                                        value={reviewForm.comment}
                                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                    ></textarea>
                                </div>

                                <button
                                    onClick={submitReview}
                                    className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-black transition-all"
                                >
                                    Submit Verified Review
                                </button>
                                <button onClick={() => setShowReviewModal(false)} className="w-full py-2 text-gray-400 font-bold hover:text-gray-600 text-sm">Cancel</button>
                            </div>
                        </div>
                    </div>
                )
            }

        </div >
    );
};

export default PublicProfile;
