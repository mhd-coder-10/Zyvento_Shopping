import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiSearch, FiEye, FiCheckCircle, FiEyeOff, FiFlag, FiXCircle, FiRefreshCw, FiStar, FiAlertTriangle } from 'react-icons/fi';
import ApiService from '../../../api/ApiService';

const ReviewsList = () => {
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [ratingFilter, setRatingFilter] = useState('all');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
    const [selectedReview, setSelectedReview] = useState(null);
    const [modReason, setModReason] = useState('');
    const [modAction, setModAction] = useState('');

    // Fetch Reviews
    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const res = await ApiService.getAllReviews({
                page: pagination.page,
                limit: pagination.limit,
                search,
                status: statusFilter,
                rating: ratingFilter
            });
            if (res.data.success) {
                setReviews(res.data.data || []);
                setPagination(res.data.pagination || {});
            }
        } catch (error) {
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, search, statusFilter, ratingFilter]);

    useEffect(() => { fetchReviews(); }, [fetchReviews]);

    // Publish Action (Direct)
    const handlePublish = async (e, reviewCode) => {
        e.stopPropagation(); // PREVENT row navigation
        try {
            await ApiService.moderateReview(reviewCode, { action: 'publish' });
            toast.success('Review published successfully');
            fetchReviews();
        } catch (error) {
            toast.error('Failed to publish review');
        }
    };

    // Open Modal for Hide/Flag/Reject
    const openModerationModal = (e, review, action) => {
        e.stopPropagation(); // PREVENT row navigation
        setSelectedReview(review);
        setModAction(action);
        setModReason('');
    };

    // Confirm Moderation (Hide/Flag/Reject)
    const confirmModeration = async () => {
        if (!modReason.trim()) {
            toast.error('Reason is required for this action');
            return;
        }
        try {
            await ApiService.moderateReview(selectedReview.review_code || selectedReview._id, { action: modAction, reason: modReason });
            toast.success(`Review ${modAction} successfully`);
            setSelectedReview(null);
            setModReason('');
            fetchReviews();
        } catch (error) {
            toast.error('Failed to update review');
        }
    };

    // Navigate to Details (ONLY View button uses this)
    const handleView = (e, reviewCode) => {
        e.stopPropagation(); // Safe navigation
        navigate(`/admin/reviews/${reviewCode}`);
    };

    // UI Helpers
    const getStatusBadge = (status) => {
        const map = {
            published: 'bg-emerald-50 text-emerald-700',
            pending: 'bg-amber-50 text-amber-700',
            flagged: 'bg-orange-50 text-orange-700',
            reported: 'bg-red-50 text-red-700',
            hidden: 'bg-gray-100 text-gray-600',
            rejected: 'bg-rose-50 text-rose-700'
        };
        return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-600'}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
    };

    const renderStars = (rating) => {
        return (
            <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 !text-gray-400" />
                    <input type="text" placeholder="Search reviews..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl !text-black" onChange={(e) => setSearch(e.target.value)} />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-xl !text-black bg-white">
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="published">Published</option>
                    <option value="flagged">Flagged</option>
                    <option value="reported">Reported</option>
                    <option value="hidden">Hidden</option>
                    <option value="rejected">Rejected</option>
                </select>
                <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-xl !text-black bg-white">
                    <option value="all">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                </select>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                {loading ? <div className="p-10 text-center"><FiRefreshCw className="animate-spin !text-blue-600 w-8 h-8 inline-block" /></div> : (
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-blue-50 to-sky-50">
                            <tr>
                                <th className="px-4 py-3 text-left pl-10 text-xs font-bold !text-blue-900 uppercase">Review</th>
                                <th className="px-4 py-3 text-center text-xs font-bold !text-blue-900 uppercase">Product</th>
                                <th className="px-4 py-3 text-center text-xs font-bold !text-blue-900 uppercase">Customer</th>
                                <th className="px-4 py-3 text-center text-xs font-bold !text-blue-900 uppercase">Rating</th>
                                <th className="px-4 py-3 text-center text-xs font-bold !text-blue-900 uppercase">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-bold !text-blue-900 uppercase">Reports</th>
                                <th className="px-4 py-3 text-center text-xs font-bold !text-blue-900 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {reviews.map(review => (
                                <tr key={review._id} className="hover:bg-blue-50/30">
                                    <td className="px-4 py-4">
                                        <p className="font-semibold text-start !text-black text-sm">{review.title || 'No Title'}</p>
                                        <p className="text-xs text-start !text-gray-600 mt-1 line-clamp-2 max-w-xs">{review.comment}</p>
                                    </td>
                                    <td className="px-4 py-4">
                                        <p className="font-semibold !text-black text-sm">{review.product_id?.product_name}</p>
                                        <p className="text-xs !text-blue-500 mt-1">{review.product_id?.product_code}</p>
                                    </td>
                                    <td className="px-4 py-4">
                                        <p className="font-semibold !text-black text-sm">{review.user_id?.first_name} {review.user_id?.last_name}</p>
                                    </td>
                                    <td className="px-4 py-4">{renderStars(review.rating)}</td>
                                    <td className="px-4 py-4">{getStatusBadge(review.status)}</td>
                                    <td className="px-4 py-4 !text-gray-600 font-bold">{review.report_count || 0}</td>

                                    <td className="px-4 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* View - ONLY button that navigates */}
                                            <button onClick={(e) => handleView(e, review.review_code)} className="p-2 bg-blue-50 !text-blue-600 rounded-lg hover:bg-blue-100" title="View"><FiEye /></button>

                                            {/* Publish */}
                                            {['pending', 'flagged', 'reported', 'hidden', 'rejected'].includes(review.status) && (
                                                <button onClick={(e) => handlePublish(e, review.review_code)} className="p-2 bg-emerald-50 !text-emerald-600 rounded-lg hover:bg-emerald-100" title="Publish"><FiCheckCircle /></button>
                                            )}

                                            {/* Hide */}
                                            {['published', 'flagged', 'reported'].includes(review.status) && (
                                                <button onClick={(e) => openModerationModal(e, review, 'hide')} className="p-2 bg-gray-50 !text-gray-600 rounded-lg hover:bg-gray-100" title="Hide"><FiEyeOff /></button>
                                            )}

                                            {/* Flag */}
                                            {['published', 'reported'].includes(review.status) && (
                                                <button onClick={(e) => openModerationModal(e, review, 'flag')} className="p-2 bg-orange-50 !text-orange-600 rounded-lg hover:bg-orange-100" title="Flag"><FiFlag /></button>
                                            )}

                                            {/* Reject - ALWAYS Visible */}
                                            <button onClick={(e) => openModerationModal(e, review, 'reject')} className="p-2 bg-red-50 !text-red-600 rounded-lg hover:bg-red-100" title="Reject"><FiXCircle /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Mobile Cards */}
            {/* <div className="md:hidden space-y-4">
                {loading ? <div className="p-10 text-center"><FiRefreshCw className="animate-spin !text-blue-600 w-8 h-8 inline-block" /></div> : (
                    reviews.map(review => (
                        <div key={review._id} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="font-bold !text-black text-sm">{review.product_id?.product_name}</p>
                                    <p className="text-xs !text-blue-500 mt-1">{review.product_id?.product_code}</p>
                                </div>
                                {getStatusBadge(review.status)}
                            </div>
                            <p className="font-semibold !text-black text-sm mt-2">{review.title || 'No Title'}</p>
                            <p className="text-xs !text-gray-600 mt-1 line-clamp-3">{review.comment}</p>
                            <div className="flex justify-between items-center mt-3">
                                <p className="text-sm !text-gray-700">{review.user_id?.first_name} {review.user_id?.last_name}</p>
                                <div className="flex items-center gap-1">
                                    <span className="text-sm font-bold !text-black">{review.rating}</span>
                                    {renderStars(review.rating)}
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-xs !text-gray-500">Reports: {review.report_count || 0}</span>
                                <div className="flex gap-2">
                                    <button onClick={(e) => handleView(e, review.review_code || review._id)} className="p-2 bg-blue-50 !text-blue-600 rounded-lg"><FiEye /></button>
                                    <button onClick={(e) => openModerationModal(e, review, 'hide')} className="p-2 bg-gray-50 !text-gray-600 rounded-lg"><FiEyeOff /></button>
                                    <button onClick={(e) => openModerationModal(e, review, 'flag')} className="p-2 bg-orange-50 !text-orange-600 rounded-lg"><FiFlag /></button>
                                    <button onClick={(e) => openModerationModal(e, review, 'reject')} className="p-2 bg-red-50 !text-red-600 rounded-lg"><FiXCircle /></button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div> */}

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {loading ? <div className="p-10 text-center"><FiRefreshCw className="animate-spin !text-blue-600 w-8 h-8 inline-block" /></div> : (
                    reviews.map(review => (
                        <div key={review._id} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="font-bold !text-black text-sm">{review.product_id?.product_name}</p>
                                    <p className="text-xs !text-blue-500 mt-1">{review.product_id?.product_code}</p>
                                </div>
                                {getStatusBadge(review.status)}
                            </div>
                            <p className="font-semibold !text-black text-sm mt-2">{review.title || 'No Title'}</p>
                            <p className="text-xs !text-gray-600 mt-1 line-clamp-3">{review.comment}</p>
                            <div className="flex justify-between items-center mt-3">
                                <p className="text-sm !text-gray-700">{review.user_id?.first_name} {review.user_id?.last_name}</p>
                                <div className="flex items-center gap-1">
                                    <span className="text-sm font-bold !text-black">{review.rating}</span>
                                    {renderStars(review.rating)}
                                </div>
                            </div>

                            {/* Actions - Same as Desktop Logic */}
                            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs !text-gray-500">Reports: {review.report_count || 0}</span>

                                    <div className="flex gap-2 flex-wrap justify-end">
                                        {/* View - ALWAYS */}
                                        <button
                                            onClick={(e) => handleView(e, review.review_code || review._id)}
                                            className="p-2 bg-blue-50 !text-blue-600 rounded-lg"
                                            title="View"
                                        >
                                            <FiEye />
                                        </button>

                                        {/* Publish - Show for Pending, Flagged, Reported, Hidden, Rejected */}
                                        {['pending', 'flagged', 'reported', 'hidden', 'rejected'].includes(review.status) && (
                                            <button
                                                onClick={(e) => handlePublish(e, review.review_code || review._id)}
                                                className="p-2 bg-emerald-50 !text-emerald-600 rounded-lg"
                                                title="Publish"
                                            >
                                                <FiCheckCircle />
                                            </button>
                                        )}

                                        {/* Hide - Show for Published, Flagged, Reported */}
                                        {['published', 'flagged', 'reported'].includes(review.status) && (
                                            <button
                                                onClick={(e) => openModerationModal(e, review, 'hide')}
                                                className="p-2 bg-gray-50 !text-gray-600 rounded-lg"
                                                title="Hide"
                                            >
                                                <FiEyeOff />
                                            </button>
                                        )}

                                        {/* Flag - Show for Published, Reported */}
                                        {['published', 'reported'].includes(review.status) && (
                                            <button
                                                onClick={(e) => openModerationModal(e, review, 'flag')}
                                                className="p-2 bg-orange-50 !text-orange-600 rounded-lg"
                                                title="Flag"
                                            >
                                                <FiFlag />
                                            </button>
                                        )}

                                        {/* Reject - ALWAYS Visible */}
                                        <button
                                            onClick={(e) => openModerationModal(e, review, 'reject')}
                                            className="p-2 bg-red-50 !text-red-600 rounded-lg"
                                            title="Reject"
                                        >
                                            <FiXCircle />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-between items-center">
                    <button disabled={pagination.page === 1} onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} className="px-4 py-2 border rounded-lg !text-black disabled:opacity-50">Previous</button>
                    <span className="text-sm !text-gray-600">Page {pagination.page} of {pagination.totalPages}</span>
                    <button disabled={pagination.page === pagination.totalPages} onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} className="px-4 py-2 border rounded-lg !text-black disabled:opacity-50">Next</button>
                </div>
            )}

            {/* Moderation Modal */}
            {selectedReview && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-orange-50 rounded-full !text-orange-600"><FiAlertTriangle className="w-6 h-6" /></div>
                            <h3 className="text-lg font-bold !text-black capitalize">{modAction} Review</h3>
                        </div>
                        <p className="text-sm !text-gray-600 mb-4">You are about to {modAction} the review by {selectedReview.user_id?.first_name}. Please provide a reason.</p>
                        <textarea className="w-full px-4 py-2 border border-gray-300 rounded-xl !text-black h-24 resize-none focus:border-blue-500" placeholder={`Enter reason for ${modAction}...`} value={modReason} onChange={(e) => setModReason(e.target.value)} />
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => setSelectedReview(null)} className="flex-1 py-2 bg-gray-100 !text-gray-600 rounded-lg hover:bg-gray-200">Cancel</button>
                            <button onClick={confirmModeration} className="flex-1 py-2 bg-blue-600 !text-white rounded-lg hover:bg-blue-700">Confirm {modAction}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewsList;