import React, { useState, useEffect } from 'react';
import { FiStar, FiCheckCircle, FiClock, FiFlag, FiAlertCircle, FiEyeOff, FiXCircle } from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';

const ReviewDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await ApiService.getReviewDashboard();
            if (res.data.success) setStats(res.data.data);
        } catch (error) {
            console.error('Failed to fetch dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!stats) return <div className="p-10 text-center">No data</div>;

    const cardConfig = [
        { label: 'Total Reviews', value: stats.total, icon: <FiStar />, color: 'bg-blue-50 text-blue-600' },
        { label: 'Published', value: stats.published, icon: <FiCheckCircle />, color: 'bg-emerald-50 text-emerald-600' },
        { label: 'Pending', value: stats.pending, icon: <FiClock />, color: 'bg-amber-50 text-amber-600' },
        { label: 'Flagged', value: stats.flagged, icon: <FiFlag />, color: 'bg-orange-50 text-orange-600' },
        { label: 'Reported', value: stats.reported, icon: <FiAlertCircle />, color: 'bg-red-50 text-red-600' },
        { label: 'Hidden', value: stats.hidden, icon: <FiEyeOff />, color: 'bg-gray-100 text-gray-600' },
        { label: 'Rejected', value: stats.rejected, icon: <FiXCircle />, color: 'bg-rose-50 text-rose-600' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar title="Review Dashboard" subtitle="Manage customer reviews" />
            
            <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {cardConfig.map((card, idx) => (
                        <div key={idx} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                            <div className={`p-2 rounded-xl ${card.color}`}>{card.icon}</div>
                            <p className="text-2xl font-bold !text-black mt-2">{card.value}</p>
                            <p className="text-xs !text-gray-600">{card.label}</p>
                        </div>
                    ))}
                </div>

                {/* Rating Distribution */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                    <h3 className="font-semibold !text-black mb-4">Rating Distribution</h3>
                    <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map(star => {
                            const count = stats.rating_distribution[star] || 0;
                            const total = stats.total || 1;
                            const percentage = (count / total) * 100;
                            return (
                                <div key={star} className="flex items-center gap-4">
                                    <span className="flex items-center gap-1 w-16">
                                        <FiStar className="text-yellow-500" /> {star}
                                    </span>
                                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                                        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                    <span className="w-10 text-right text-sm !text-gray-600">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                    <p className="mt-4 text-sm !text-gray-600">Average Rating: <span className="font-bold !text-black">{stats.average_rating.toFixed(1)} / 5</span></p>
                </div>
            </div>
        </div>
    );
};

export default ReviewDashboard;