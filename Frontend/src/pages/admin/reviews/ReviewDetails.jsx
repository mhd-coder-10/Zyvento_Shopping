
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { FiArrowLeft, FiRefreshCw, FiCheckCircle, FiEyeOff, FiFlag, FiXCircle, FiStar, FiUser, FiPackage, FiShoppingBag, FiAlertTriangle } from 'react-icons/fi';
// import ApiService from '../../../api/ApiService';
// import AdminTopbar from '../../../components/admin/AdminTopbar';

// const ReviewDetails = () => {
//     const { reviewCode } = useParams();
//     const navigate = useNavigate();
//     const [review, setReview] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [modReason, setModReason] = useState('');
//     const [modAction, setModAction] = useState('');

//     useEffect(() => {
//         fetchReview();
//     }, [reviewCode]);

//     const fetchReview = async () => {
//         try {
//             const res = await ApiService.getReviewDetails(reviewCode);
//             if (res.data.success) {
//                 setReview(res.data.data);
//             } else {
//                 toast.error('Review not found');
//                 navigate('/admin/reviews');
//             }
//         } catch (error) {
//             toast.error('Failed to load review details');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleModeration = async (action) => {
//         if (!modReason.trim() && ['hide', 'flag', 'reject'].includes(action)) {
//             toast.error('Please provide a reason');
//             return;
//         }
//         try {
//             await ApiService.moderateReview(reviewCode, { action, reason: modReason });
//             toast.success('Review moderated successfully');
//             setModReason('');
//             fetchReview();
//         } catch (error) {
//             toast.error('Failed to moderate review');
//         }
//     };

//     if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center"><FiRefreshCw className="animate-spin !text-blue-600 w-8 h-8" /></div>;
//     if (!review) return <div className="text-center py-12 !text-gray-600">Review not found</div>;

//     const getStatusBadge = (status) => {
//         const map = {
//             published: 'bg-emerald-50 text-emerald-700',
//             pending: 'bg-amber-50 text-amber-700',
//             flagged: 'bg-orange-50 text-orange-700',
//             reported: 'bg-red-50 text-red-700',
//             hidden: 'bg-gray-100 text-gray-600',
//             rejected: 'bg-rose-50 text-rose-700'
//         };
//         return (
//             <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-600'}`}>
//                 {status.charAt(0).toUpperCase() + status.slice(1)}
//             </span>
//         );
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
//             <AdminTopbar title="Review Details" subtitle={review.review_code || review._id}
//                 actions={
//                     <button onClick={() => navigate('/admin/reviews')} className="flex items-center gap-2 px-4 py-2 border border-blue-200 !text-blue-600 rounded-xl bg-white shadow-sm">
//                         <FiArrowLeft /> Back
//                     </button>
//                 }
//             />

//             {/* FIX 1: Added min-w-0 to prevent squeezing */}
//             <div className="w-full min-w-0 max-w-7xl mx-auto px-4 md:px-6 space-y-6">

//                 {/* Review Content Card - FIX 2: flex-col on mobile */}
//                 <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
//                     <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
//                         <div className="w-full">
//                             <div className="flex items-center gap-2 mb-2">
//                                 <h3 className="font-bold !text-black text-lg">{review.title || 'No Title'}</h3>
//                                 {getStatusBadge(review.status)}
//                             </div>
//                             <p className="!text-gray-700">{review.comment}</p>
//                             <div className="flex items-center gap-1 mt-3">
//                                 {[...Array(5)].map((_, i) => (
//                                     <FiStar key={i} className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
//                                 ))}
//                                 <span className="ml-2 text-sm font-bold !text-black">{review.rating}/5</span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Moderation Actions - FIX 3: flex-wrap on mobile */}
//                 {/* <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
//                     <h3 className="font-semibold !text-black mb-4">Moderation Actions</h3>
//                     <div className="flex flex-wrap gap-3 mb-4">
//                         <button onClick={() => handleModeration('publish')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 !text-white rounded-lg hover:bg-emerald-700">
//                             <FiCheckCircle /> Publish
//                         </button>
//                         <button onClick={() => handleModeration('hide')} className="flex items-center gap-2 px-4 py-2 bg-gray-600 !text-white rounded-lg hover:bg-gray-700">
//                             <FiEyeOff /> Hide
//                         </button>
//                         <button onClick={() => handleModeration('flag')} className="flex items-center gap-2 px-4 py-2 bg-orange-600 !text-white rounded-lg hover:bg-orange-700">
//                             <FiFlag /> Flag
//                         </button>
//                         <button onClick={() => handleModeration('reject')} className="flex items-center gap-2 px-4 py-2 bg-red-600 !text-white rounded-lg hover:bg-red-700">
//                             <FiXCircle /> Reject
//                         </button>
//                     </div>
//                     <textarea
//                         className="w-full px-4 py-2 border border-gray-300 rounded-xl !text-black h-24 resize-none focus:border-blue-500"
//                         placeholder="Enter reason (required for Hide/Flag/Reject)"
//                         value={modReason}
//                         onChange={(e) => setModReason(e.target.value)}
//                     />
//                 </div> */}

//                 {/* Moderation Actions - FIXED */}
//                 <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
//                     <h3 className="font-semibold !text-black mb-4">Moderation Actions</h3>

//                     {/* Buttons: Reject is always visible */}
//                     <div className="flex flex-wrap gap-3 mb-4">
//                         <button onClick={() => handleModeration('publish')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 !text-white rounded-lg">
//                             <FiCheckCircle /> Publish
//                         </button>
//                         <button onClick={() => handleModeration('hide')} className="flex items-center gap-2 px-4 py-2 bg-gray-600 !text-white rounded-lg">
//                             <FiEyeOff /> Hide
//                         </button>
//                         <button onClick={() => handleModeration('flag')} className="flex items-center gap-2 px-4 py-2 bg-orange-600 !text-white rounded-lg">
//                             <FiFlag /> Flag
//                         </button>
//                         <button onClick={() => handleModeration('reject')} className="flex items-center gap-2 px-4 py-2 bg-red-600 !text-white rounded-lg">
//                             <FiXCircle /> Reject
//                         </button>
//                     </div>

//                     <textarea
//                         className="w-full px-4 py-2 border border-gray-300 rounded-xl !text-black h-24 resize-none focus:border-blue-500"
//                         placeholder="Enter reason (required for Hide/Flag/Reject)"
//                         value={modReason}
//                         onChange={(e) => setModReason(e.target.value)}
//                     />
//                 </div>

//                 {/* Details Grid - FIX 4: grid-cols-1 always stacks on mobile */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
//                         <h3 className="font-semibold !text-black mb-3 flex items-center gap-2">
//                             <FiUser className="!text-blue-600" /> Customer
//                         </h3>
//                         <p className="!text-black font-semibold">{review.user_id?.first_name} {review.user_id?.last_name}</p>
//                         <p className="!text-gray-600">{review.user_id?.email}</p>
//                         <p className="!text-gray-600">ID: {review.user_id?._id}</p>
//                     </div>
//                     <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
//                         <h3 className="font-semibold !text-black mb-3 flex items-center gap-2">
//                             <FiPackage className="!text-blue-600" /> Product
//                         </h3>
//                         <p className="!text-black font-semibold">{review.product_id?.product_name}</p>
//                         <p className="!text-blue-600">{review.product_id?.product_code}</p>
//                         <p className="!text-gray-600">Category: {review.product_id?.category_id?.category_name || 'N/A'}</p>
//                     </div>
//                     <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
//                         <h3 className="font-semibold !text-black mb-3 flex items-center gap-2">
//                             <FiShoppingBag className="!text-blue-600" /> Seller
//                         </h3>
//                         <p className="!text-black font-semibold">{review.seller_id?.business_name || 'N/A'}</p>
//                         <p className="!text-gray-600">Seller ID: {review.seller_id?._id}</p>
//                     </div>
//                     <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
//                         <h3 className="font-semibold !text-black mb-3">Order Info</h3>
//                         <p className="!text-black">Order Code: {review.order_code || 'N/A'}</p>
//                         <p className="!text-gray-600">Verified Purchase: {review.is_verified_purchase ? 'Yes' : 'No'}</p>
//                     </div>
//                 </div>

//                 {/* Moderation History */}
//                 <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
//                     <h3 className="font-semibold !text-black mb-4">Moderation History</h3>
//                     {review.moderation_history?.length > 0 ? (
//                         <div className="space-y-3">
//                             {review.moderation_history.map((history, idx) => (
//                                 <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
//                                     <div className="flex items-center gap-2 mb-1">
//                                         <span className="text-sm font-bold !text-black">{history.action}</span>
//                                         <span className="text-xs !text-gray-500">({history.previous_status} → {history.new_status})</span>
//                                     </div>
//                                     <p className="text-xs !text-gray-600">
//                                         Reason: {history.reason || 'N/A'} | Admin: {history.admin_id?.first_name || 'Unknown'} | Date: {new Date(history.timestamp).toLocaleString('en-IN')}
//                                     </p>
//                                 </div>
//                             ))}
//                         </div>
//                     ) : <p className="!text-gray-600">No moderation history yet.</p>}
//                 </div>


//             </div>
//         </div>
//     );
// };

// export default ReviewDetails;



import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiArrowLeft,
    FiRefreshCw,
    FiStar,
    FiUser,
    FiPackage,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle,
    FiThumbsUp,
    FiClock,
    FiEye,
    FiEyeOff,
    FiFlag,
    FiX,
    FiMessageSquare,
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import ApiService from '../../../api/ApiService';

const formatDate = (d) =>
    d
        ? new Date(d).toLocaleString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          })
        : 'N/A';

const STATUS_BADGE = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    flagged: 'bg-orange-50 text-orange-700 border-orange-200',
    reported: 'bg-rose-50 text-rose-700 border-rose-200',
    hidden: 'bg-slate-50 text-slate-600 border-slate-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
};

const ReviewDetails = () => {
    const { reviewId } = useParams();
    const navigate = useNavigate();

    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [pendingAction, setPendingAction] = useState('');
    const [reason, setReason] = useState('');
    const [adminComment, setAdminComment] = useState('');

    const fetchReview = useCallback(async () => {
        if (!reviewId) return;
        setLoading(true);
        setError('');
        try {
            const res = await ApiService.getReviewById(reviewId);
            const data = res?.data?.data || res?.data || null;
            if (!data) {
                setError('Review not found');
                setReview(null);
            } else {
                setReview(data);
            }
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to load review');
        } finally {
            setLoading(false);
        }
    }, [reviewId]);

    useEffect(() => {
        fetchReview();
    }, [fetchReview]);

    const openModerationModal = (action) => {
        setPendingAction(action);
        setReason('');
        setAdminComment('');
        setShowModal(true);
    };

    const handleModerate = async () => {
        if (!pendingAction) return;

        setActionLoading(true);
        try {
            await ApiService.moderateReview(reviewId, {
                action: pendingAction,
                reason: reason || '',
                admin_comment: adminComment || '',
            });
            toast.success(`Review ${pendingAction}ed successfully`);
            setShowModal(false);
            fetchReview();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to moderate review');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-white">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                    <p className="text-slate-700 font-medium">Loading review...</p>
                </div>
            </div>
        );
    }

    if (error || !review) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="bg-white border border-sky-100 rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiAlertCircle size={38} className="text-sky-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Could not load review</h2>
                    <p className="text-slate-600 mb-6 text-sm">{error}</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={fetchReview}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-sky-200 text-slate-800 rounded-xl hover:bg-sky-50 font-medium"
                        >
                            <FiRefreshCw size={16} /> Retry
                        </button>
                        <button
                            onClick={() => navigate('/admin/reviews')}
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium"
                        >
                            Back to Reviews
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 via-[#eaf4ff] to-white pb-10">
            {/* HEADER */}
            <div className="bg-white/90 backdrop-blur-sm border-b border-sky-100 sticky top-0 z-20">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={() => navigate('/admin/reviews')}
                            className="p-2.5 bg-sky-50 text-slate-700 border border-sky-200 rounded-xl hover:bg-sky-100 shrink-0"
                        >
                            <FiArrowLeft size={20} />
                        </button>
                        <div className="min-w-0">
                            <h1
                                className="truncate"
                                style={{ color: '#0f172a', fontWeight: 900, fontSize: '1.5rem' }}
                            >
                                Review Details
                            </h1>
                            <p className="text-sm text-slate-600 truncate">{review.review_code}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchReview}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-sky-200 text-slate-700 rounded-xl hover:bg-sky-50 text-sm"
                        >
                            <FiRefreshCw size={16} /> Refresh
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-5 space-y-5">
                {/* STATUS + ACTIONS */}
                <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Current Status</p>
                            <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold capitalize ${
                                    STATUS_BADGE[review.status] || STATUS_BADGE.pending
                                }`}
                            >
                                {review.status}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {review.status !== 'published' && (
                                <button
                                    onClick={() => openModerationModal('publish')}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 text-sm font-medium"
                                >
                                    <FiCheckCircle size={16} /> Publish
                                </button>
                            )}
                            {review.status !== 'hidden' && (
                                <button
                                    onClick={() => openModerationModal('hide')}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-600 text-white rounded-xl hover:bg-slate-700 text-sm font-medium"
                                >
                                    <FiEyeOff size={16} /> Hide
                                </button>
                            )}
                            {review.status !== 'rejected' && (
                                <button
                                    onClick={() => openModerationModal('reject')}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 text-sm font-medium"
                                >
                                    <FiXCircle size={16} /> Reject
                                </button>
                            )}
                            {review.status !== 'flagged' && (
                                <button
                                    onClick={() => openModerationModal('flag')}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 text-sm font-medium"
                                >
                                    <FiFlag size={16} /> Flag
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* REVIEW CONTENT */}
                <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5 sm:p-6">
                    <div className="flex items-start gap-4 mb-5">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-sky-500 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                            {(review.user_id?.first_name?.[0] || 'U').toUpperCase()}
                            {(review.user_id?.last_name?.[0] || '').toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-800">
                                {review.user_id?.first_name} {review.user_id?.last_name}
                            </p>
                            <p className="text-xs text-slate-500">{review.user_id?.email}</p>
                            <p className="text-xs text-slate-400 mt-1">
                                {formatDate(review.created_at)}
                            </p>
                        </div>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <FiStar
                                    key={n}
                                    size={18}
                                    className={
                                        n <= review.rating
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'text-slate-300'
                                    }
                                />
                            ))}
                        </div>
                    </div>

                    {review.title && (
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">{review.title}</h3>
                    )}
                    {review.comment && (
                        <p className="text-slate-700 leading-relaxed">{review.comment}</p>
                    )}

                    {review.images?.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {review.images.map((img, i) => (
                                <img
                                    key={i}
                                    src={img}
                                    alt={`Review ${i + 1}`}
                                    className="w-full h-24 object-cover rounded-lg border border-slate-200"
                                />
                            ))}
                        </div>
                    )}

                    {review.is_verified_purchase && (
                        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-medium text-emerald-700">
                            <FiCheckCircle size={14} /> Verified Purchase
                        </div>
                    )}
                </div>

                {/* PRODUCT + SELLER */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5">
                        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <FiPackage className="text-blue-600" /> Product
                        </h3>
                        <div className="space-y-2 text-sm">
                            <p className="text-slate-700">
                                <span className="text-slate-500">Name:</span>{' '}
                                {review.product_id?.product_name || 'N/A'}
                            </p>
                            <p className="text-slate-700">
                                <span className="text-slate-500">Code:</span>{' '}
                                {review.product_code || 'N/A'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5">
                        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <FiUser className="text-blue-600" /> Seller
                        </h3>
                        <div className="space-y-2 text-sm">
                            <p className="text-slate-700">
                                <span className="text-slate-500">Business:</span>{' '}
                                {review.seller_id?.business_name || 'N/A'}
                            </p>
                            <p className="text-slate-700">
                                <span className="text-slate-500">Email:</span>{' '}
                                {review.seller_id?.email || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* MODERATION HISTORY */}
                {review.moderation_history?.length > 0 && (
                    <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <FiClock className="text-blue-600" /> Moderation History
                        </h3>
                        <div className="space-y-3">
                            {review.moderation_history
                                .slice()
                                .reverse()
                                .map((h, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 bg-slate-50 rounded-xl border border-slate-100"
                                    >
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className="text-xs font-semibold text-blue-700 capitalize">
                                                {h.action}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                {h.previous_status} → {h.new_status}
                                            </span>
                                            <span className="text-xs text-slate-400 ml-auto">
                                                {formatDate(h.timestamp)}
                                            </span>
                                        </div>
                                        {h.reason && (
                                            <p className="text-xs text-slate-600">{h.reason}</p>
                                        )}
                                        {h.admin_id && (
                                            <p className="text-xs text-slate-400 mt-1">
                                                By: {h.admin_id.first_name} {h.admin_id.last_name}
                                            </p>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>

            {/* MODERATION MODAL */}
            {showModal && (
                <div
                    className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center px-4"
                    onClick={() => setShowModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900 capitalize">
                                {pendingAction} Review
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-lg"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Reason (Optional)
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={2}
                                    placeholder="Reason for this action..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Admin Comment (Optional)
                                </label>
                                <textarea
                                    value={adminComment}
                                    onChange={(e) => setAdminComment(e.target.value)}
                                    rows={2}
                                    placeholder="Internal notes..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-sky-200 text-slate-700 rounded-xl hover:bg-sky-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleModerate}
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium disabled:opacity-60 capitalize"
                                >
                                    {actionLoading ? 'Processing...' : `Confirm ${pendingAction}`}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ReviewDetails;