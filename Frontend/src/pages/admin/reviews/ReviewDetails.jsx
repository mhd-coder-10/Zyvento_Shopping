
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiRefreshCw, FiCheckCircle, FiEyeOff, FiFlag, FiXCircle, FiStar, FiUser, FiPackage, FiShoppingBag, FiAlertTriangle } from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';

const ReviewDetails = () => {
    const { reviewCode } = useParams();
    const navigate = useNavigate();
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modReason, setModReason] = useState('');
    const [modAction, setModAction] = useState('');

    useEffect(() => {
        fetchReview();
    }, [reviewCode]);

    const fetchReview = async () => {
        try {
            const res = await ApiService.getReviewDetails(reviewCode);
            if (res.data.success) {
                setReview(res.data.data);
            } else {
                toast.error('Review not found');
                navigate('/admin/reviews');
            }
        } catch (error) {
            toast.error('Failed to load review details');
        } finally {
            setLoading(false);
        }
    };

    const handleModeration = async (action) => {
        if (!modReason.trim() && ['hide', 'flag', 'reject'].includes(action)) {
            toast.error('Please provide a reason');
            return;
        }
        try {
            await ApiService.moderateReview(reviewCode, { action, reason: modReason });
            toast.success('Review moderated successfully');
            setModReason('');
            fetchReview();
        } catch (error) {
            toast.error('Failed to moderate review');
        }
    };

    if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center"><FiRefreshCw className="animate-spin !text-blue-600 w-8 h-8" /></div>;
    if (!review) return <div className="text-center py-12 !text-gray-600">Review not found</div>;

    const getStatusBadge = (status) => {
        const map = {
            published: 'bg-emerald-50 text-emerald-700',
            pending: 'bg-amber-50 text-amber-700',
            flagged: 'bg-orange-50 text-orange-700',
            reported: 'bg-red-50 text-red-700',
            hidden: 'bg-gray-100 text-gray-600',
            rejected: 'bg-rose-50 text-rose-700'
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-600'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar title="Review Details" subtitle={review.review_code || review._id}
                actions={
                    <button onClick={() => navigate('/admin/reviews')} className="flex items-center gap-2 px-4 py-2 border border-blue-200 !text-blue-600 rounded-xl bg-white shadow-sm">
                        <FiArrowLeft /> Back
                    </button>
                }
            />

            {/* FIX 1: Added min-w-0 to prevent squeezing */}
            <div className="w-full min-w-0 max-w-7xl mx-auto px-4 md:px-6 space-y-6">

                {/* Review Content Card - FIX 2: flex-col on mobile */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="w-full">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-bold !text-black text-lg">{review.title || 'No Title'}</h3>
                                {getStatusBadge(review.status)}
                            </div>
                            <p className="!text-gray-700">{review.comment}</p>
                            <div className="flex items-center gap-1 mt-3">
                                {[...Array(5)].map((_, i) => (
                                    <FiStar key={i} className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                                ))}
                                <span className="ml-2 text-sm font-bold !text-black">{review.rating}/5</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Moderation Actions - FIX 3: flex-wrap on mobile */}
                {/* <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                    <h3 className="font-semibold !text-black mb-4">Moderation Actions</h3>
                    <div className="flex flex-wrap gap-3 mb-4">
                        <button onClick={() => handleModeration('publish')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 !text-white rounded-lg hover:bg-emerald-700">
                            <FiCheckCircle /> Publish
                        </button>
                        <button onClick={() => handleModeration('hide')} className="flex items-center gap-2 px-4 py-2 bg-gray-600 !text-white rounded-lg hover:bg-gray-700">
                            <FiEyeOff /> Hide
                        </button>
                        <button onClick={() => handleModeration('flag')} className="flex items-center gap-2 px-4 py-2 bg-orange-600 !text-white rounded-lg hover:bg-orange-700">
                            <FiFlag /> Flag
                        </button>
                        <button onClick={() => handleModeration('reject')} className="flex items-center gap-2 px-4 py-2 bg-red-600 !text-white rounded-lg hover:bg-red-700">
                            <FiXCircle /> Reject
                        </button>
                    </div>
                    <textarea
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl !text-black h-24 resize-none focus:border-blue-500"
                        placeholder="Enter reason (required for Hide/Flag/Reject)"
                        value={modReason}
                        onChange={(e) => setModReason(e.target.value)}
                    />
                </div> */}

                {/* Moderation Actions - FIXED */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                    <h3 className="font-semibold !text-black mb-4">Moderation Actions</h3>

                    {/* Buttons: Reject is always visible */}
                    <div className="flex flex-wrap gap-3 mb-4">
                        <button onClick={() => handleModeration('publish')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 !text-white rounded-lg">
                            <FiCheckCircle /> Publish
                        </button>
                        <button onClick={() => handleModeration('hide')} className="flex items-center gap-2 px-4 py-2 bg-gray-600 !text-white rounded-lg">
                            <FiEyeOff /> Hide
                        </button>
                        <button onClick={() => handleModeration('flag')} className="flex items-center gap-2 px-4 py-2 bg-orange-600 !text-white rounded-lg">
                            <FiFlag /> Flag
                        </button>
                        <button onClick={() => handleModeration('reject')} className="flex items-center gap-2 px-4 py-2 bg-red-600 !text-white rounded-lg">
                            <FiXCircle /> Reject
                        </button>
                    </div>

                    <textarea
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl !text-black h-24 resize-none focus:border-blue-500"
                        placeholder="Enter reason (required for Hide/Flag/Reject)"
                        value={modReason}
                        onChange={(e) => setModReason(e.target.value)}
                    />
                </div>

                {/* Details Grid - FIX 4: grid-cols-1 always stacks on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                        <h3 className="font-semibold !text-black mb-3 flex items-center gap-2">
                            <FiUser className="!text-blue-600" /> Customer
                        </h3>
                        <p className="!text-black font-semibold">{review.user_id?.first_name} {review.user_id?.last_name}</p>
                        <p className="!text-gray-600">{review.user_id?.email}</p>
                        <p className="!text-gray-600">ID: {review.user_id?._id}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                        <h3 className="font-semibold !text-black mb-3 flex items-center gap-2">
                            <FiPackage className="!text-blue-600" /> Product
                        </h3>
                        <p className="!text-black font-semibold">{review.product_id?.product_name}</p>
                        <p className="!text-blue-600">{review.product_id?.product_code}</p>
                        <p className="!text-gray-600">Category: {review.product_id?.category_id?.category_name || 'N/A'}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                        <h3 className="font-semibold !text-black mb-3 flex items-center gap-2">
                            <FiShoppingBag className="!text-blue-600" /> Seller
                        </h3>
                        <p className="!text-black font-semibold">{review.seller_id?.business_name || 'N/A'}</p>
                        <p className="!text-gray-600">Seller ID: {review.seller_id?._id}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                        <h3 className="font-semibold !text-black mb-3">Order Info</h3>
                        <p className="!text-black">Order Code: {review.order_code || 'N/A'}</p>
                        <p className="!text-gray-600">Verified Purchase: {review.is_verified_purchase ? 'Yes' : 'No'}</p>
                    </div>
                </div>

                {/* Moderation History */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                    <h3 className="font-semibold !text-black mb-4">Moderation History</h3>
                    {review.moderation_history?.length > 0 ? (
                        <div className="space-y-3">
                            {review.moderation_history.map((history, idx) => (
                                <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-bold !text-black">{history.action}</span>
                                        <span className="text-xs !text-gray-500">({history.previous_status} → {history.new_status})</span>
                                    </div>
                                    <p className="text-xs !text-gray-600">
                                        Reason: {history.reason || 'N/A'} | Admin: {history.admin_id?.first_name || 'Unknown'} | Date: {new Date(history.timestamp).toLocaleString('en-IN')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : <p className="!text-gray-600">No moderation history yet.</p>}
                </div>


            </div>
        </div>
    );
};

export default ReviewDetails;