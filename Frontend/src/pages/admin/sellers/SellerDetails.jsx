
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiArrowLeft,
    FiEdit2,
    FiMail,
    FiShield,
    FiPhone,
    FiMapPin,
    FiBriefcase,
    FiCalendar,
    FiCheckCircle,
    FiXCircle,
    FiClock,
    FiUser,
    FiUsers,
    FiPackage,
    FiStar,
    FiRefreshCw,
    FiAlertCircle,
    FiFileText,
    FiShoppingBag,
    FiActivity,
    FiTrendingUp,
    FiDollarSign,
    FiHash,
} from 'react-icons/fi';
import { FaStore } from 'react-icons/fa';
import { motion } from 'framer-motion';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';
// import {toast} from 'react-toastify';


/* ================= STATUS CONFIG ================= */

const STATUS_BADGE_STYLES = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive: 'bg-slate-50 text-slate-600 border-slate-200',
    suspended: 'bg-rose-50 text-rose-700 border-rose-200',
};

const VERIFICATION_STYLES = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    under_review: 'bg-blue-50 text-blue-700 border-blue-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    suspended: 'bg-orange-50 text-orange-700 border-orange-200',
};

/* ================= HELPERS ================= */

const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(value || 0);

const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/* ================= SMALL COMPONENTS ================= */

const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors min-w-0">
        <div className="mt-0.5 text-blue-600 shrink-0">{icon}</div>
        <div className="min-w-0">
            <p className="text-xs text-slate-500 mb-0.5">{label}</p>
            <p className="text-sm font-medium text-slate-900 break-words">{value || 'N/A'}</p>
        </div>
    </div>
);

const StatCard = ({ icon, title, value, subtext, color }) => (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
        <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1 truncate">{title}</p>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{value}</h3>
                {subtext && <p className="text-[11px] sm:text-xs text-slate-400 mt-1 truncate">{subtext}</p>}
            </div>
            <div className={`p-2.5 sm:p-3 rounded-xl shrink-0 ${color}`}>{icon}</div>
        </div>
    </div>
);

const EmptyTab = ({ icon, title, subtitle }) => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="p-4 bg-sky-50 rounded-full mb-4">{icon}</div>
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
);

const StatusBadge = ({ status }) => (
    <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold capitalize ${STATUS_BADGE_STYLES[status] || STATUS_BADGE_STYLES.pending
            }`}
    >
        {status || 'pending'}
    </span>
);

const VerificationBadge = ({ status }) => (
    <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold capitalize ${VERIFICATION_STYLES[status] || VERIFICATION_STYLES.pending
            }`}
    >
        <FiCheckCircle size={11} />
        {status?.replace(/_/g, ' ') || 'pending'}
    </span>
);

/* ================= MAIN COMPONENT ================= */

const SellerDetails = () => {
    const { sellerCode } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [refreshing, setRefreshing] = useState(false);


    /* ================= FETCH ================= */
    const fetchDetails = useCallback(async (silent = false) => {
        if (!sellerCode) return;

        // Only show full-page loader on initial load, not on refresh
        if (!silent) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }

        if (silent) {
            toast.success('Data refreshed');
        }
        setError('');
        try {
            const res = await ApiService.getSellerByCode(sellerCode);
            const payload = res?.data?.data || res?.data || null;
            if (!payload || !payload.seller) {
                setError('Seller not found');
                setData(null);
            } else {
                setData(payload);
            }
        } catch (err) {
            console.error('Error fetching seller:', err);
            setError(err?.response?.data?.message || err?.message || 'Failed to load seller');
            toast.error('Failed to load seller details');
        } finally {
            if (!silent) {
                setLoading(false);
            } else {
                setRefreshing(false);
            }
        }
    }, [sellerCode]);


    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);


    /* ================= LOADING ================= */

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 via-[#eaf4ff] to-white">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                    <p className="text-slate-700 font-medium">Loading seller details...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="bg-white border border-sky-100 rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiAlertCircle size={38} className="text-sky-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Could not load seller</h2>
                    <p className="text-slate-600 mb-6 text-sm">{error || 'Seller not found'}</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={fetchDetails}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-sky-200 text-slate-800 rounded-xl hover:bg-sky-50 font-medium"
                        >
                            <FiRefreshCw size={16} /> Retry
                        </button>
                        <button
                            onClick={() => navigate('/admin/sellers')}
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium"
                        >
                            Back to Sellers
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const seller = data.seller || {};
    const employees = data.employees || [];
    const statistics = data.statistics || {};
    const reviews = statistics.reviews || {};
    const complaints = statistics.complaints || {};
    const recentOrders = data.recentOrders || [];
    const recentReviews = data.recentReviews || [];

    const initials = (seller.business_name || 'S').charAt(0).toUpperCase();

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <FiBriefcase size={16} /> },
        { id: 'employees', label: `Employees (${employees.length})`, icon: <FiUsers size={16} /> },
        { id: 'products', label: 'Products', icon: <FiPackage size={16} /> },
        { id: 'reviews', label: `Reviews (${reviews.totalReviews || 0})`, icon: <FiStar size={16} /> },
        { id: 'complaints', label: `Complaints (${complaints.total || 0})`, icon: <FiAlertCircle size={16} /> },
        { id: 'activity', label: 'Activity', icon: <FiActivity size={16} /> },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 via-[#eaf4ff] to-white pb-10">

            {/* HEADER */}
            <AdminTopbar
                title="Seller Details"
                subtitle={seller.business_name}
                actions={
                    <div className="flex items-center gap-2">

                        <button
                            onClick={() => fetchDetails(true)}
                            disabled={refreshing}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-sky-300 hover:bg-sky-50 sm:px-4 disabled:opacity-60"
                        >
                            <FiRefreshCw size={15} className={refreshing ? 'animate-spin' : ''} /> Refresh
                        </button>

                        <button onClick={() => navigate(`/admin/sellers/edit/${sellerCode}`)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02]">
                            <FiEdit2 className="w-5 h-5" /> Edit Seller
                        </button>
                    </div>
                }
            />

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5 space-y-5">

                {/* ========== SELLER PROFILE CARD ========== */}
                <div className="bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-500" />

                    <div className="p-5 sm:p-6">

                        {/* ========== DESKTOP LAYOUT ========== */}
                        <div className="hidden lg:flex lg:items-center gap-6">
                            {/* Left: Avatar */}
                            <div className="relative shrink-0">
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-white text-3xl font-black shadow-lg ring-4 ring-sky-100">
                                    {initials}
                                </div>
                                <span
                                    className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-4 border-white ${String(seller.account_status || '').toLowerCase() === 'active'
                                        ? 'bg-emerald-500'
                                        : 'bg-slate-400'
                                        }`}
                                />
                            </div>

                            {/* Middle: Name + Owner + Badges (CENTERED) */}
                            <div className="flex-1 min-w-0 flex flex-col items-center justify-center gap-2 text-center">
                                <h2
                                    className="w-full truncate"
                                    style={{
                                        color: '#020617',
                                        WebkitTextFillColor: '#020617',
                                        fontWeight: 900,
                                        fontSize: '1.5rem',
                                        lineHeight: '2rem',
                                        letterSpacing: '-0.025em',
                                        opacity: 1,
                                        filter: 'none',
                                        mixBlendMode: 'normal',
                                    }}
                                >
                                    {seller.business_name || 'Unnamed Business'}
                                </h2>
                                <p
                                    className="text-sm mt-1 w-full truncate"
                                    style={{ color: '#475569' }}
                                >
                                    {seller.owner_name || 'Owner N/A'} • {seller.business_type || 'Individual'}
                                </p>

                                {/* Badges Centered Below */}
                                <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                                    <StatusBadge status={seller.account_status} />
                                    <VerificationBadge status={seller.verification_status} />
                                </div>
                            </div>

                            {/* Right: Seller Code + Joined Date Cards */}
                            <div className="grid grid-cols-1 gap-2 w-64 shrink-0">

                                {/* Seller Code Card */}
                                <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100 rounded-xl">
                                    <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                                        <FiHash className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="min-w-0 text-start ml-2.5">
                                        <p
                                            className="text-[10px] font-bold uppercase tracking-wider"
                                            style={{ color: '#64748b' }}
                                        >
                                            Seller Code
                                        </p>
                                        <p
                                            className="text-sm font-mono font-bold truncate"
                                            style={{ color: '#1d4ed8' }}
                                        >
                                            {seller.seller_code || sellerCode}
                                        </p>
                                    </div>
                                </div>

                                {/* Joined Date Card */}
                                {seller.created_at && (
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                                            <FiClock className="w-4 h-4 text-slate-600" />
                                        </div>
                                        <div className="min-w-0 text-start ml-2.5">
                                            <p
                                                className="text-[10px] font-bold uppercase tracking-wider"
                                                style={{ color: '#64748b' }}
                                            >
                                                Joined
                                            </p>
                                            <p
                                                className="text-sm font-semibold truncate"
                                                style={{ color: '#0f172a' }}
                                            >
                                                {new Date(seller.created_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ========== MOBILE LAYOUT ========== */}
                        <div className="flex flex-col lg:hidden">
                            {/* Avatar */}
                            <div className="flex justify-center">
                                <div className="relative shrink-0">
                                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-white text-3xl font-black shadow-lg ring-4 ring-sky-100">
                                        {initials}
                                    </div>
                                    <span
                                        className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-4 border-white ${String(seller.account_status || '').toLowerCase() === 'active'
                                            ? 'bg-emerald-500'
                                            : 'bg-slate-400'
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Centered Name + Owner + Badges */}
                            <div className="text-center mt-4">
                                <h2
                                    className="truncate"
                                    style={{
                                        color: '#020617',
                                        WebkitTextFillColor: '#020617',
                                        fontWeight: 900,
                                        fontSize: '1.35rem',
                                        lineHeight: '1.85rem',
                                        letterSpacing: '-0.025em',
                                        opacity: 1,
                                        filter: 'none',
                                        mixBlendMode: 'normal',
                                    }}
                                >
                                    {seller.business_name || 'Unnamed Business'}
                                </h2>

                                <p
                                    className="truncate text-sm mt-1"
                                    style={{ color: '#475569' }}
                                >
                                    {seller.owner_name || 'Owner N/A'} • {seller.business_type || 'Individual'}
                                </p>

                                <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                                    <StatusBadge status={seller.account_status} />
                                    <VerificationBadge status={seller.verification_status} />
                                </div>
                            </div>

                            {/* ========== User Code + Joined Cards (Like UserDetails) ========== */}
                            <div className="grid grid-cols-1 gap-2 mt-5">
                                {/* Seller Code Card */}
                                <div className="flex gap-3 p-3 bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100 rounded-xl">
                                    <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                                        <FiHash className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="min-w-0 flex-1 text-start ml-4">
                                        <p
                                            className="text-[10px] font-bold uppercase tracking-wider"
                                            style={{ color: '#64748b' }}
                                        >
                                            Seller Code
                                        </p>
                                        <p
                                            className="text-sm font-mono font-bold truncate"
                                            style={{ color: '#1d4ed8' }}
                                        >
                                            {seller.seller_code || sellerCode}
                                        </p>
                                    </div>
                                </div>

                                {/* Joined Date Card */}
                                {seller.created_at && (
                                    <div className="flex text-start  items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                                            <FiClock className="w-4 h-4 text-slate-600" />
                                        </div>
                                        <div className="min-w-0 flex-1 ml-4">
                                            <p
                                                className="text-[10px] font-bold uppercase tracking-wider"
                                                style={{ color: '#64748b' }}
                                            >
                                                Joined
                                            </p>
                                            <p
                                                className="text-sm font-semibold truncate"
                                                style={{ color: '#0f172a' }}
                                            >
                                                {new Date(seller.created_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* ========== STATS ========== */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                    <StatCard
                        icon={<FiPackage size={20} className="text-blue-600" />}
                        title="Products"
                        value={statistics.totalProducts || 0}
                        subtext={`${statistics.activeProducts || 0} active`}
                        color="bg-blue-100"
                    />
                    <StatCard
                        icon={<FiShoppingBag size={20} className="text-purple-600" />}
                        title="Total Orders"
                        value={statistics.totalOrders || 0}
                        subtext="Lifetime orders"
                        color="bg-purple-100"
                    />
                    <StatCard
                        icon={<FiStar size={20} className="text-amber-600" />}
                        title="Avg Rating"
                        value={reviews.averageRating ? reviews.averageRating.toFixed(1) : '0.0'}
                        subtext={`${reviews.totalReviews || 0} reviews`}
                        color="bg-amber-100"
                    />
                    <StatCard
                        icon={<FiAlertCircle size={20} className="text-rose-600" />}
                        title="Complaints"
                        value={complaints.total || 0}
                        subtext={`${complaints.pending || 0} pending`}
                        color="bg-rose-100"
                    />
                </div>

                {/* ========== TABS ========== */}
                <div className="bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-1 sm:gap-2 p-3 sm:p-4 border-b border-sky-100 overflow-x-auto">
                        {tabs.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === t.id
                                    ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md shadow-blue-200'
                                    : 'text-slate-700 hover:bg-sky-50'
                                    }`}
                            >
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-4 sm:p-6">
                        {/* OVERVIEW */}
                        {activeTab === 'overview' && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5"
                            >
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                        <FiUser className="text-blue-600" /> Contact Information
                                    </h3>
                                    <InfoRow icon={<FiMail size={16} />} label="Email" value={seller.email} />
                                    <InfoRow icon={<FiPhone size={16} />} label="Phone" value={seller.mobile_number} />
                                    <InfoRow
                                        icon={<FiUser size={16} />}
                                        label="Owner"
                                        value={seller.owner_name}
                                    />
                                    <InfoRow
                                        icon={<FiBriefcase size={16} />}
                                        label="Business Type"
                                        value={seller.business_type}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                        <FiMapPin className="text-blue-600" /> Address & Registration
                                    </h3>
                                    <InfoRow
                                        icon={<FiMapPin size={16} />}
                                        label="Street"
                                        value={seller.business_address?.street}
                                    />
                                    <InfoRow
                                        icon={<FiMapPin size={16} />}
                                        label="City / State"
                                        value={`${seller.business_address?.city || ''} ${seller.business_address?.state || ''}`.trim()}
                                    />
                                    <InfoRow
                                        icon={<FiFileText size={16} />}
                                        label="GST Number"
                                        value={seller.gst_number}
                                    />
                                    <InfoRow
                                        icon={<FiFileText size={16} />}
                                        label="PAN Number"
                                        value={seller.pan_number}
                                    />
                                    <InfoRow
                                        icon={<FiShield size={16} />}
                                        label="Commission Rate"
                                        value={`${seller.commission_rate || 10}%`}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* EMPLOYEES */}
                        {activeTab === 'employees' && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {employees.length === 0 ? (
                                    <EmptyTab
                                        icon={<FiUsers size={28} className="text-sky-500" />}
                                        title="No employees"
                                        subtitle="This seller has not added any employees yet."
                                    />
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[720px]">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                                                        Employee
                                                    </th>
                                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">
                                                        Role
                                                    </th>
                                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">
                                                        Department
                                                    </th>
                                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">
                                                        Status
                                                    </th>
                                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">
                                                        Joined
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {employees.map((emp, idx) => (
                                                    <tr key={emp._id || idx} className="hover:bg-sky-50/40">
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-sky-500 text-white flex items-center justify-center text-xs font-semibold">
                                                                    {(emp.user_id?.first_name?.[0] || 'U').toUpperCase()}
                                                                    {(emp.user_id?.last_name?.[0] || '').toUpperCase()}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="font-medium text-slate-800 truncate">
                                                                        {emp.user_id?.first_name} {emp.user_id?.last_name}
                                                                    </p>
                                                                    <p className="text-xs text-slate-500 truncate">
                                                                        {emp.user_id?.email}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className="inline-block px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-[11px] font-semibold capitalize">
                                                                {(emp.employee_type || 'employee').replace(/_/g, ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center text-xs text-slate-600">
                                                            {emp.department || 'N/A'}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <StatusBadge status={emp.status || 'active'} />
                                                        </td>
                                                        <td className="px-4 py-3 text-center text-xs text-slate-500">
                                                            {formatDate(emp.created_at)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* PRODUCTS */}
                        {activeTab === 'products' && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <EmptyTab
                                    icon={<FiPackage size={28} className="text-sky-500" />}
                                    title="Products Tab Coming Soon"
                                    subtitle="Detailed product list with filters will be added here."
                                />
                            </motion.div>
                        )}

                        {/* REVIEWS */}
                        {activeTab === 'reviews' && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-5"
                            >
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                    <div className="p-4 bg-slate-50 rounded-xl">
                                        <p className="text-xs text-slate-500">Total</p>
                                        <p className="text-xl font-bold text-slate-900">
                                            {reviews.totalReviews || 0}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-amber-50 rounded-xl">
                                        <p className="text-xs text-slate-500">Average</p>
                                        <p className="text-xl font-bold text-amber-700">
                                            {reviews.averageRating ? reviews.averageRating.toFixed(1) : '0.0'}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-emerald-50 rounded-xl">
                                        <p className="text-xs text-slate-500">5 Star</p>
                                        <p className="text-xl font-bold text-emerald-700">
                                            {reviews.fiveStar || 0}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-blue-50 rounded-xl">
                                        <p className="text-xs text-slate-500">4 Star</p>
                                        <p className="text-xl font-bold text-blue-700">
                                            {reviews.fourStar || 0}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-orange-50 rounded-xl">
                                        <p className="text-xs text-slate-500">3 Star</p>
                                        <p className="text-xl font-bold text-orange-700">
                                            {reviews.threeStar || 0}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-rose-50 rounded-xl">
                                        <p className="text-xs text-slate-500">1-2 Star</p>
                                        <p className="text-xl font-bold text-rose-700">
                                            {(reviews.oneStar || 0) + (reviews.twoStar || 0)}
                                        </p>
                                    </div>
                                </div>

                                {recentReviews.length === 0 ? (
                                    <EmptyTab
                                        icon={<FiStar size={28} className="text-sky-500" />}
                                        title="No reviews yet"
                                        subtitle="Customer reviews will appear here once they start coming in."
                                    />
                                ) : (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold text-slate-700">
                                            Recent Reviews
                                        </h4>
                                        {recentReviews.map((r) => (
                                            <div
                                                key={r._id}
                                                className="p-4 bg-slate-50 rounded-xl border border-slate-100"
                                            >
                                                <div className="flex items-start justify-between gap-3 mb-2">
                                                    <div className="flex items-center gap-2">
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
                                                        <span className="text-xs text-slate-500">
                                                            {r.user_id?.first_name} {r.user_id?.last_name}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-slate-400">
                                                        {formatDate(r.created_at)}
                                                    </span>
                                                </div>
                                                {r.title && (
                                                    <p className="font-medium text-slate-800 text-sm mb-1">
                                                        {r.title}
                                                    </p>
                                                )}
                                                {r.comment && (
                                                    <p className="text-sm text-slate-600">{r.comment}</p>
                                                )}
                                                <p className="text-xs text-slate-400 mt-2">
                                                    Product: {r.product_id?.product_name || 'N/A'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* COMPLAINTS */}
                        {activeTab === 'complaints' && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {complaints.total === 0 ? (
                                    <EmptyTab
                                        icon={<FiAlertCircle size={28} className="text-emerald-500" />}
                                        title="No complaints"
                                        subtitle="This seller has a clean record."
                                    />
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                        <div className="p-4 bg-amber-50 rounded-xl">
                                            <p className="text-xs text-slate-500">Pending</p>
                                            <p className="text-xl font-bold text-amber-700">
                                                {complaints.pending || 0}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-blue-50 rounded-xl">
                                            <p className="text-xs text-slate-500">Under Review</p>
                                            <p className="text-xl font-bold text-blue-700">
                                                {complaints.under_review || 0}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-emerald-50 rounded-xl">
                                            <p className="text-xs text-slate-500">Resolved</p>
                                            <p className="text-xl font-bold text-emerald-700">
                                                {complaints.resolved || 0}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-rose-50 rounded-xl">
                                            <p className="text-xs text-slate-500">Rejected</p>
                                            <p className="text-xl font-bold text-rose-700">
                                                {complaints.rejected || 0}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-xl">
                                            <p className="text-xs text-slate-500">Escalated</p>
                                            <p className="text-xl font-bold text-slate-700">
                                                {complaints.escalated || 0}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* ACTIVITY */}
                        {activeTab === 'activity' && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-3"
                            >
                                <InfoRow
                                    icon={<FiCalendar size={16} />}
                                    label="Account created"
                                    value={formatDateTime(seller.created_at)}
                                />
                                <InfoRow
                                    icon={<FiActivity size={16} />}
                                    label="Last updated"
                                    value={formatDateTime(seller.updated_at)}
                                />
                                {seller.approved_at && (
                                    <InfoRow
                                        icon={<FiCheckCircle size={16} />}
                                        label="Approved on"
                                        value={formatDateTime(seller.approved_at)}
                                    />
                                )}
                                {seller.approved_by && (
                                    <InfoRow
                                        icon={<FiUser size={16} />}
                                        label="Approved by"
                                        value={`${seller.approved_by.first_name || ''} ${seller.approved_by.last_name || ''}`.trim()}
                                    />
                                )}

                                {recentOrders.length > 0 && (
                                    <div className="pt-4">
                                        <h4 className="text-sm font-semibold text-slate-700 mb-3">
                                            Recent Orders
                                        </h4>
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-[600px]">
                                                <thead className="bg-slate-50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">
                                                            Order
                                                        </th>
                                                        <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">
                                                            Amount
                                                        </th>
                                                        <th className="px-4 py-2 text-center text-xs font-semibold text-slate-500 uppercase">
                                                            Status
                                                        </th>
                                                        <th className="px-4 py-2 text-center text-xs font-semibold text-slate-500 uppercase">
                                                            Date
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {recentOrders.map((o) => (
                                                        <tr key={o._id} className="hover:bg-sky-50/40">
                                                            <td className="px-4 py-3 text-sm font-medium text-slate-800">
                                                                {o.order_code || o.order_number}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-right font-bold text-slate-900">
                                                                {formatCurrency(o.total_amount)}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <StatusBadge status={o.order_status} />
                                                            </td>
                                                            <td className="px-4 py-3 text-center text-xs text-slate-500">
                                                                {formatDate(o.created_at)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerDetails;