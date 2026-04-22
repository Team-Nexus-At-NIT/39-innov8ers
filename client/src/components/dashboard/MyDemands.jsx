import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import { Clock } from 'lucide-react'; // Kept for empty state if needed
import DemandCard from './DemandCard'; // Import the polished component

const MyDemands = () => {
    const [demands, setDemands] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyDemands = async () => {
            try {
                const { data } = await api.get('/demands/my');
                setDemands(data.data);
            } catch (error) {
                console.error("Failed to fetch demands", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyDemands();
    }, []);

    const handleAcceptBid = async (demandId, application) => {
        try {
            const { data } = await api.put(`/demands/${demandId}/accept/${application._id}`);
            toast.success(data.message);
            // Refresh logic - ideally should update local state but reload is robust for now
            window.location.reload();
        } catch (error) {
            toast.error("Failed to accept bid: " + (error.response?.data?.error || error.message));
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Loading your postings...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">My Posted Requirements</h2>
                <div className="text-sm text-gray-500">
                    Showing {demands.length} posting{demands.length !== 1 && 's'}
                </div>
            </div>

            <div className="grid gap-6">
                {demands.length > 0 ? (
                    demands.map(demand => (
                        <DemandCard
                            key={demand._id}
                            demand={demand}
                            onAcceptBid={handleAcceptBid}
                        />
                    ))
                ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <div className="bg-white p-4 rounded-full shadow-sm inline-block mb-4">
                            <Clock className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No Requirements Posted</h3>
                        <p className="text-gray-500 text-sm max-w-sm mx-auto">
                            You haven't posted any crop requirements yet. Create a new demand to start receiving offers from farmers.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyDemands;
