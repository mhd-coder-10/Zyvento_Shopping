
// import React, { useState, useEffect } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import AdminTopbar from '../../../components/admin/AdminTopbar';
// import ReviewDashboard from './ReviewDashboard';
// import ReviewsList from './ReviewsList';
// import ReviewReports from './ReviewReports';

// const Reviews = () => {
//     const [searchParams, setSearchParams] = useSearchParams();
    
//     // Read tab from URL, default to 'reviews' if not present or invalid
//     const validTabs = ['dashboard', 'reviews', 'reports'];
//     const initialTab = validTabs.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'reviews';
//     const [activeTab, setActiveTab] = useState(initialTab);

//     // Update URL whenever tab changes
//     useEffect(() => {
//         setSearchParams({ tab: activeTab });
//     }, [activeTab, setSearchParams]);

//     const tabs = [
//         { id: 'dashboard', label: 'Dashboard' },
//         { id: 'reviews', label: 'Reviews' },
//         { id: 'reports', label: 'Reports' }
//     ];

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
//             <AdminTopbar title="Review Management" subtitle="Manage customer product reviews" />

//             <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
                
//                 {/* Tabs UI */}
//                 <div className="flex gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
//                     {tabs.map(tab => (
//                         <button
//                             key={tab.id}
//                             onClick={() => setActiveTab(tab.id)}
//                             className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
//                                 activeTab === tab.id
//                                     ? 'bg-blue-600 !text-white shadow-md'
//                                     : 'bg-gray-100 !text-gray-700 hover:bg-gray-200'
//                             }`}
//                         >
//                             {tab.label}
//                         </button>
//                     ))}
//                 </div>

//                 {/* Tab Content (No Reload) */}
//                 <div className="mt-6">
//                     {activeTab === 'dashboard' && <ReviewDashboard />}
//                     {activeTab === 'reviews' && <ReviewsList />}
//                     {activeTab === 'reports' && <ReviewReports />}
//                 </div>

//             </div>
//         </div>
//     );
// };

// export default Reviews;




import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiSearch,
    FiRefreshCw,
    FiChevronLeft,
    FiChevronRight,
    FiStar,
    FiEye,
    FiCheckCircle,
    FiXCircle,
    FiClock,
    FiAlertCircle,
    FiThumbsUp,
    FiX,
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import ApiService from '../../../api/ApiService';

/* ================= HELPERS ================= */

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'published', label: 'Published' },
    { value: 'flagged', label: 'Flagged' },
    { value: 'reported', label: 'Reported' },
    { value: 'hidden', label: 'Hidden' },
    { value: 'rejected', label: 'Rejected' },
];

const STATUS_BADGE = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    flagged: 'bg-orange-50 text-orange-700 border-orange-200',
    reported: 'bg-rose-50 text-rose-700 border-rose-200',
    hidden: 'bg-slate-50 text-slate-600 border-slate-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
};

const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

const StatusBadge = ({ status }) => (
    <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold capitalize ${
            STATUS_BADGE[status] || STATUS_BADGE.pending
        }`}
    >
        {status || 'pending'}
    </span>
);

const StatCard = ({ icon, title, value, color, accent }) => (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
        <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {title}
                </p>
                <p className="mt-1.5 text-2xl font-bold text-slate-900">{value}</p>
            </div>
            <div className={`${color} grid h-10 w-10 shrink-0 place-items-center rounded-lg`}>
                {icon}
            </div>
        </div>
    </div>
);

/* ================= MAIN COMPONENT ================= */

const Reviews = () => {
    const navigate = useNavigate();

    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [ratingFilter, setRatingFilter] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalReviews, setTotalReviews] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        setLoadError('');
        try {
            const params = { page: currentPage, limit: itemsPerPage };
            if (debouncedSearch) params.search = debouncedSearch;
            if (statusFilter !== 'all') params.status = statusFilter;
            if (ratingFilter) params.rating = ratingFilter;

            const res = await ApiService.getAllReviews(params);
            const payload = res?.data || {};
            const list = Array.isArray(payload.data)
                ? payload.data
                : payload.data?.reviews || payload.reviews || [];
            const pag = payload.pagination || payload.data?.pagination || {};

            setReviews(list);
            setTotalPages(pag.totalPages || 1);
            setTotalReviews(pag.total || list.length);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setReviews([]);
            setLoadError(error?.response?.data?.message || 'Failed to fetch reviews');
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearch, statusFilter, ratingFilter]);

    const fetchStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const res = await ApiService.getReviewStats();
            setStats(res?.data?.data || res?.data || null);
        } catch (error) {
            console.error('Error fetching review stats:', error);
        } finally {
            setStatsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, statusFilter, ratingFilter]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const activeFilterCount =
        (statusFilter !== 'all' ? 1 : 0) + (ratingFilter ? 1 : 0) + (searchQuery ? 1 : 0);

    const handleClearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setRatingFilter('');
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* HEADER */}
            <header className="relative z-30 border-b border-slate-200 bg-white">
                <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm">
                            <FiStar size={20} />
                        </div>
                        <div className="min-w-0">
                            <h1
                                className="truncate"
                                style={{
                                    color: '#0f172a',
                                    fontWeight: 900,
                                    fontSize: '1.75rem',
                                    lineHeight: '2.25rem',
                                }}
                            >
                                Review Management
                            </h1>
                            <p className="mt-1 text-sm" style={{ color: '#475569' }}>
                                Moderate customer reviews across all sellers and products
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                fetchReviews();
                                fetchStats();
                            }}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            <FiRefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-[1600px] space-y-5 p-4 sm:p-6">
                {loadError && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm">
                        <FiAlertCircle size={16} /> {loadError}
                    </div>
                )}

                {/* STATS */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
                    <StatCard
                        icon={<FiStar size={18} className="text-blue-600" />}
                        title="Total Reviews"
                        value={statsLoading ? '—' : stats?.totalReviews ?? 0}
                        color="bg-blue-100"
                        accent="bg-blue-500"
                    />
                    <StatCard
                        icon={<FiCheckCircle size={18} className="text-emerald-600" />}
                        title="Published"
                        value={statsLoading ? '—' : stats?.publishedReviews ?? 0}
                        color="bg-emerald-100"
                        accent="bg-emerald-500"
                    />
                    <StatCard
                        icon={<FiClock size={18} className="text-amber-600" />}
                        title="Pending"
                        value={statsLoading ? '—' : stats?.pendingReviews ?? 0}
                        color="bg-amber-100"
                        accent="bg-amber-500"
                    />
                    <StatCard
                        icon={<FiAlertCircle size={18} className="text-rose-600" />}
                        title="Reported"
                        value={statsLoading ? '—' : stats?.reportedReviews ?? 0}
                        color="bg-rose-100"
                        accent="bg-rose-500"
                    />
                    <StatCard
                        icon={<FiThumbsUp size={18} className="text-purple-600" />}
                        title="Avg Rating"
                        value={
                            statsLoading
                                ? '—'
                                : stats?.averageRating
                                    ? stats.averageRating.toFixed(2)
                                    : '0.00'
                        }
                        color="bg-purple-100"
                        accent="bg-purple-500"
                    />
                </div>

                {/* FILTERS + LIST */}
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 p-4 sm:p-5">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="relative sm:col-span-2 xl:col-span-1">
                                <FiSearch
                                    size={16}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    value={searchQuery}
                                    placeholder="Search reviews..."
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-9 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    >
                                        <FiX size={15} />
                                    </button>
                                )}
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500"
                            >
                                {STATUS_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={ratingFilter}
                                onChange={(e) => setRatingFilter(e.target.value)}
                                className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500"
                            >
                                <option value="">All Ratings</option>
                                <option value="5">5 Stars</option>
                                <option value="4">4 Stars</option>
                                <option value="3">3 Stars</option>
                                <option value="2">2 Stars</option>
                                <option value="1">1 Star</option>
                            </select>
                        </div>

                        {activeFilterCount > 0 && (
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className="text-xs text-slate-500">Active filters:</span>
                                {statusFilter !== 'all' && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                        {STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label}
                                        <button
                                            onClick={() => setStatusFilter('all')}
                                            className="hover:text-blue-900"
                                        >
                                            <FiX size={12} />
                                        </button>
                                    </span>
                                )}
                                {ratingFilter && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                                        {ratingFilter} Stars
                                        <button
                                            onClick={() => setRatingFilter('')}
                                            className="hover:text-amber-900"
                                        >
                                            <FiX size={12} />
                                        </button>
                                    </span>
                                )}
                                <button
                                    onClick={handleClearFilters}
                                    className="ml-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
                                >
                                    Clear all
                                </button>
                            </div>
                        )}
                    </div>

                    {/* MOBILE CARDS */}
                    <div className="space-y-3 p-3 sm:p-4 xl:hidden">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="h-32 bg-sky-50 rounded-xl animate-pulse" />
                            ))
                        ) : reviews.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">No reviews found</div>
                        ) : (
                            reviews.map((r) => (
                                <div
                                    key={r._id}
                                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                                    onClick={() => navigate(`/admin/reviews/${r._id}`)}
                                >
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <FiStar
                                                    key={n}
                                                    size={14}
                                                    className={
                                                        n <= r.rating
                                                            ? 'fill-amber-400 text-amber-400'
                                                            : 'text-slate-300'
                                                    }
                                                />
                                            ))}
                                        </div>
                                        <StatusBadge status={r.status} />
                                    </div>
                                    <p className="font-medium text-slate-800 text-sm mb-1 line-clamp-2">
                                        {r.title || r.comment || 'No title'}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        By {r.user_id?.first_name} {r.user_id?.last_name}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {r.product_id?.product_name || 'Product N/A'} • {formatDate(r.created_at)}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>

                    {/* DESKTOP TABLE */}
                    <div className="hidden overflow-x-auto xl:block">
                        <table className="w-full min-w-[1000px]">
                            <thead className="bg-sky-50/60">
                                <tr>
                                    {['Review', 'Customer', 'Product / Seller', 'Rating', 'Status', 'Date', 'Actions'].map(
                                        (h) => (
                                            <th
                                                key={h}
                                                className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide ${
                                                    h === 'Actions' ? 'text-center' : 'text-left'
                                                }`}
                                            >
                                                {h}
                                            </th>
                                        )
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sky-50">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i}>
                                            {[...Array(7)].map((__, j) => (
                                                <td key={j} className="px-4 py-4">
                                                    <div className="h-4 bg-sky-50 rounded animate-pulse" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : reviews.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-slate-500">
                                            No reviews found
                                        </td>
                                    </tr>
                                ) : (
                                    reviews.map((r) => (
                                        <tr
                                            key={r._id}
                                            className="hover:bg-sky-50/40 transition-colors"
                                        >
                                            <td className="px-4 py-4">
                                                <div className="min-w-0 max-w-[280px]">
                                                    <p className="font-medium text-slate-800 truncate text-sm">
                                                        {r.title || r.comment?.slice(0, 50) || 'No title'}
                                                    </p>
                                                    <p className="text-xs text-slate-400 truncate">
                                                        {r.review_code}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-slate-800 truncate">
                                                        {r.user_id?.first_name} {r.user_id?.last_name}
                                                    </p>
                                                    <p className="text-xs text-slate-400 truncate">
                                                        {r.user_id?.email}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="min-w-0">
                                                    <p className="text-sm text-slate-700 truncate">
                                                        {r.product_id?.product_name || 'N/A'}
                                                    </p>
                                                    <p className="text-xs text-slate-400 truncate">
                                                        {r.seller_id?.business_name || 'N/A'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1">
                                                    <FiStar
                                                        size={14}
                                                        className="fill-amber-400 text-amber-400"
                                                    />
                                                    <span className="text-sm font-semibold text-slate-800">
                                                        {r.rating}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <StatusBadge status={r.status} />
                                            </td>
                                            <td className="px-4 py-4 text-xs text-slate-500">
                                                {formatDate(r.created_at)}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <button
                                                    onClick={() => navigate(`/admin/reviews/${r._id}`)}
                                                    className="p-2 text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg"
                                                    title="View review"
                                                >
                                                    <FiEye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    {!loading && reviews.length > 0 && (
                        <div className="grid grid-cols-1 items-center gap-3 border-t border-slate-200 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto]">
                            <p className="text-xs text-slate-500">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                                {Math.min(currentPage * itemsPerPage, totalReviews)} of {totalReviews} reviews
                            </p>
                            <div className="flex items-center justify-center gap-1 sm:justify-end">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-sky-200 text-slate-600 disabled:opacity-40 hover:bg-sky-50"
                                >
                                    <FiChevronLeft size={16} />
                                </button>
                                <span className="px-3 text-sm text-slate-600">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-sky-200 text-slate-600 disabled:opacity-40 hover:bg-sky-50"
                                >
                                    <FiChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default Reviews;