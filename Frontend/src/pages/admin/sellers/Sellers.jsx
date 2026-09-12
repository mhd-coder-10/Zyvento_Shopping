
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiPlus,
    FiEye,
    FiEdit2,
    FiTrash2,
    FiSearch,
    FiDownload,
    FiRefreshCw,
    FiChevronLeft,
    FiChevronRight,
    FiMail,
    FiPhone,
    FiX,
    FiAlertCircle,
    FiCheckCircle,
    FiClock,
    FiXCircle,
    FiTrendingUp,
    FiShield,
} from 'react-icons/fi';
import { FaStore } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import ApiService from '../../../api/ApiService';

/* ================= FILTER OPTIONS ================= */

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'rejected', label: 'Rejected' },
];

const BUSINESS_TYPE_OPTIONS = [
    { value: 'all', label: 'All Business Types' },
    { value: 'individual', label: 'Individual' },
    { value: 'company', label: 'Company' },
    { value: 'brand', label: 'Brand' },
    { value: 'partnership', label: 'Partnership' },
];

/* ================= HELPERS ================= */

// Primary identifier for navigation and URLs - uses seller_code
const sellerCode = (s) => s?.seller_code || s?._id || '';
const businessName = (s) => s?.business_name || 'Unnamed Business';
const ownerName = (s) => s?.owner_name || 'N/A';
const emailOf = (s) => s?.email || '';
const phoneOf = (s) => s?.mobile_number || s?.phone || '';
const joinedOf = (s) => s?.created_at || s?.createdAt || null;
const verificationStatus = (s) => s?.verification_status || 'pending';

/* ================= STATUS BADGE ================= */

const getStatusBadge = (status) => {
    const map = {
        pending: { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: FiClock, label: 'Pending' },
        approved: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: FiCheckCircle, label: 'Approved' },
        active: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: FiCheckCircle, label: 'Active' },
        inactive: { bg: 'bg-slate-50 text-slate-600 border-slate-200', icon: FiXCircle, label: 'Inactive' },
        suspended: { bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: FiAlertCircle, label: 'Suspended' },
        rejected: { bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: FiXCircle, label: 'Rejected' },
    };
    const cfg = map[status] || map.pending;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${cfg.bg}`}>
            <Icon size={11} /> {cfg.label}
        </span>
    );
};

/* ================= VERIFICATION BADGE ================= */

const getVerificationBadge = (status) => {
    const map = {
        pending: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Verification Pending' },
        under_review: { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Under Review' },
        approved: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Verified' },
        rejected: { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Rejected' },
        suspended: { bg: 'bg-orange-50 text-orange-700 border-orange-200', label: 'Suspended' },
    };
    const cfg = map[status] || map.pending;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${cfg.bg}`}>
            <FiShield size={10} /> {cfg.label}
        </span>
    );
};

/* ================= STAT CARD ================= */

const StatCard = ({ icon, title, value, subtext, color, accent }) => (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
        <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
        <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{title}</p>
                <p className="mt-1.5 text-2xl font-bold text-slate-900">{value}</p>
                {subtext && <p className="mt-1 text-[11px] text-slate-400 truncate">{subtext}</p>}
            </div>
            <div className={`${color} grid h-10 w-10 shrink-0 place-items-center rounded-lg`}>{icon}</div>
        </div>
    </div>
);

/* ================= EMPTY STATE ================= */

const EmptyState = ({ onClear }) => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="p-4 bg-sky-50 rounded-full mb-4">
            <FaStore size={28} className="text-sky-500" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">No sellers found</h3>
        <p className="text-sm text-slate-500 mt-1">Try changing your filters or search.</p>
        {onClear && (
            <button onClick={onClear} className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50">
                Clear all filters
            </button>
        )}
    </div>
);

/* ================= MAIN COMPONENT ================= */

const Sellers = () => {
    const navigate = useNavigate();

    const [sellers, setSellers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [businessTypeFilter, setBusinessTypeFilter] = useState('all');
    const [verificationFilter, setVerificationFilter] = useState('all');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalSellers, setTotalSellers] = useState(0);
    const itemsPerPage = 10;

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [sellerToDelete, setSellerToDelete] = useState(null);

    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
        return () => clearTimeout(t);
    }, [searchQuery]);

    // ========== FETCH SELLERS ==========
    const fetchSellers = useCallback(async () => {
        // console.log('Fetching sellers with params:', { currentPage, itemsPerPage, debouncedSearch, statusFilter, verificationFilter, businessTypeFilter });
        setLoading(true);
        setLoadError('');
        try {
            const params = { page: currentPage, limit: itemsPerPage };
            if (debouncedSearch) params.search = debouncedSearch;
            if (statusFilter && statusFilter !== 'all') params.account_status = statusFilter;
            if (verificationFilter && verificationFilter !== 'all') params.verification_status = verificationFilter;
            if (businessTypeFilter && businessTypeFilter !== 'all') params.business_type = businessTypeFilter;

            const res = await ApiService.getAllSellers(params);
            const payload = res?.data || {};

            const list = Array.isArray(payload.data)
                ? payload.data
                : payload.data?.sellers || payload.sellers || [];

            const pag = payload.pagination || payload.data?.pagination || {};

            setSellers(list);
            setTotalPages(pag.totalPages || 1);
            setTotalSellers(pag.total || list.length);

        } catch (error) {
            console.error('Error fetching sellers:', error);
            setSellers([]);
            setLoadError(error?.response?.data?.message || error?.message || 'Failed to fetch sellers');
            toast.error('Failed to fetch sellers');
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage, debouncedSearch, statusFilter, verificationFilter, businessTypeFilter]);

    // ========== FETCH STATS ==========
    const fetchStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const res = await ApiService.getSellerStats();
            const payload = res?.data?.data || res?.data || null;
            if (payload) setStats(payload);
        } catch (error) {
            console.error('Error fetching seller stats:', error);
        } finally {
            setStatsLoading(false);
        }
    }, []);

    useEffect(() => { fetchSellers(); }, [fetchSellers]);
    useEffect(() => { fetchStats(); }, [fetchStats]);
    useEffect(() => { setCurrentPage(1); }, [debouncedSearch, statusFilter, verificationFilter, businessTypeFilter]);

    // ========== HANDLERS ==========

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const handleDeleteClick = (seller) => {
        setSellerToDelete(seller);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!sellerToDelete) return;
        try {
            // Use dedicated deleteSeller API (cascade delete)
            const identifier = sellerCode(sellerToDelete);
            await ApiService.deleteSeller(identifier);
            toast.success('Seller and all related data permanently deleted');
            setShowDeleteModal(false);
            setSellerToDelete(null);
            fetchSellers();
            fetchStats();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to delete seller');
        }
    };

    const handleExport = async () => {
        try {
            const params = {};
            if (debouncedSearch) params.search = debouncedSearch;
            if (statusFilter !== 'all') params.status = statusFilter;

            const res = await ApiService.exportSellers(params);
            const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sellers-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success('Sellers exported');
        } catch (error) {
            toast.error('Failed to export sellers');
        }
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setVerificationFilter('all');
        setBusinessTypeFilter('all');
        setCurrentPage(1);
    };

    const activeFilterCount =
        (statusFilter !== 'all' ? 1 : 0) +
        (verificationFilter !== 'all' ? 1 : 0) +
        (businessTypeFilter !== 'all' ? 1 : 0) +
        (searchQuery ? 1 : 0);

    // ========== RENDER ==========

    return (
        <div className="min-h-screen min-w-0 overflow-x-hidden bg-slate-50">
            {/* Header*/}
            <AdminTopbar
                title="Seller Management"
                subtitle="Manage all sellers and their information"
                actions={
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => { fetchSellers(); fetchStats(); }}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-sky-300 hover:bg-sky-50 sm:px-4"
                        >
                            <FiRefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
                        </button>

                        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-all shadow-sm">
                            <FiDownload className="w-4 h-4" /> Export
                        </button>
                    </div>
                }
            />

            <main className="mx-auto w-full max-w-[1600px] space-y-5 p-4 sm:p-6">
                {loadError && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm">
                        <FiAlertCircle size={16} /> {loadError}
                    </div>
                )}

                {/* STATS CARDS */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
                    <StatCard
                        icon={<FaStore size={18} className="text-blue-600" />}
                        title="Total Sellers"
                        value={statsLoading ? '—' : stats?.totalSellers ?? 0}
                        subtext={`${stats?.activeSellers || 0} active`}
                        color="bg-blue-100"
                        accent="bg-blue-500"
                    />
                    <StatCard
                        icon={<FiCheckCircle size={18} className="text-emerald-600" />}
                        title="Active"
                        value={statsLoading ? '—' : stats?.activeSellers ?? 0}
                        subtext="Currently selling"
                        color="bg-emerald-100"
                        accent="bg-emerald-500"
                    />
                    <StatCard
                        icon={<FiClock size={18} className="text-amber-600" />}
                        title="Pending"
                        value={statsLoading ? '—' : stats?.pendingSellers ?? 0}
                        subtext="Awaiting approval"
                        color="bg-amber-100"
                        accent="bg-amber-500"
                    />
                    <StatCard
                        icon={<FiTrendingUp size={18} className="text-sky-600" />}
                        title="Approved"
                        value={statsLoading ? '—' : stats?.approvedSellers ?? 0}
                        subtext="Verified sellers"
                        color="bg-sky-100"
                        accent="bg-sky-500"
                    />
                    <StatCard
                        icon={<FiAlertCircle size={18} className="text-rose-600" />}
                        title="Suspended"
                        value={statsLoading ? '—' : stats?.suspendedSellers ?? 0}
                        subtext="Blocked access"
                        color="bg-rose-100"
                        accent="bg-rose-500"
                    />
                </div>

                {/* FILTERS + TABLE */}
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 p-4 sm:p-5">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="relative min-w-0 sm:col-span-2 xl:col-span-1">
                                <FiSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={searchQuery}
                                    placeholder="Search business, owner, email..."
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-9 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <FiX size={15} />
                                    </button>
                                )}
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                {STATUS_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>

                            <select
                                value={verificationFilter}
                                onChange={(e) => setVerificationFilter(e.target.value)}
                                className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="all">All Verification</option>
                                <option value="pending">Verification Pending</option>
                                <option value="under_review">Under Review</option>
                                <option value="approved">Verified</option>
                                <option value="rejected">Verification Rejected</option>
                            </select>

                            <select
                                value={businessTypeFilter}
                                onChange={(e) => setBusinessTypeFilter(e.target.value)}
                                className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                {BUSINESS_TYPE_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>

                        {activeFilterCount > 0 && (
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className="text-xs text-slate-500">Active filters:</span>
                                {statusFilter !== 'all' && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                        {STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label}
                                        <button onClick={() => setStatusFilter('all')} className="hover:text-blue-900">
                                            <FiX size={12} />
                                        </button>
                                    </span>
                                )}
                                {verificationFilter !== 'all' && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                        {verificationFilter.replace(/_/g, ' ')}
                                        <button onClick={() => setVerificationFilter('all')} className="hover:text-emerald-900">
                                            <FiX size={12} />
                                        </button>
                                    </span>
                                )}
                                {businessTypeFilter !== 'all' && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 border border-sky-200 px-2.5 py-0.5 text-xs font-medium text-sky-700">
                                        {businessTypeFilter}
                                        <button onClick={() => setBusinessTypeFilter('all')} className="hover:text-sky-900">
                                            <FiX size={12} />
                                        </button>
                                    </span>
                                )}
                                <button onClick={handleClearFilters} className="ml-1 text-xs font-semibold text-rose-600 hover:text-rose-700">
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
                        ) : sellers.length === 0 ? (
                            <EmptyState onClear={activeFilterCount ? handleClearFilters : null} />
                        ) : (
                            sellers.map((seller) => (
                                <div key={sellerCode(seller)} className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="w-11 h-11 mt-1 rounded-full bg-gradient-to-br from-blue-500 to-sky-500 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-md ring-2 ring-sky-100">
                                            {businessName(seller).charAt(0).toUpperCase()}
                                        </div>

                                        <div className="flex-1 min-w-0 text-sm text-start ml-6">
                                            <p className="font-semibold text-slate-800 truncate">{businessName(seller)}</p>
                                            <p className="text-xs text-slate-500 truncate">{ownerName(seller)}</p>
                                            <p className="text-xs text-slate-500 truncate mt-0.5">{emailOf(seller)}</p>
                                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                                {getStatusBadge(seller.account_status)}
                                                {getVerificationBadge(verificationStatus(seller))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 text-start grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-slate-100 pt-3">
                                        <span className="text-xs text-slate-400">
                                            {joinedOf(seller) ? new Date(joinedOf(seller)).toLocaleDateString() : 'N/A'}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => navigate(`/admin/sellers/${sellerCode(seller)}`)}
                                                title="View"
                                                className="p-2 text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 rounded-lg"
                                            >
                                                <FiEye size={15} />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/admin/sellers/edit/${sellerCode(seller)}`)}
                                                title="Edit"
                                                className="p-2 text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg"
                                            >
                                                <FiEdit2 size={15} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(seller)}
                                                title="Delete"
                                                className="p-2 text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg"
                                            >
                                                <FiTrash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* DESKTOP TABLE */}
                    <div className="hidden overflow-x-auto xl:block">
                        <table className="w-full min-w-[1100px]">
                            <thead className="bg-sky-50/60">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Seller</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Contact</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Business Type</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Verification</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Joined</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide sticky right-0 bg-sky-50/95">Actions</th>
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
                                ) : sellers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7}>
                                            <EmptyState onClear={activeFilterCount ? handleClearFilters : null} />
                                        </td>
                                    </tr>
                                ) : (
                                    sellers.map((seller) => (
                                        <tr
                                            key={sellerCode(seller)}
                                            className="hover:bg-sky-50/40 transition-colors cursor-pointer"
                                            onClick={() => navigate(`/admin/sellers/${sellerCode(seller)}`)}
                                        >
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-sky-500 text-white flex items-center justify-center text-xs font-bold">
                                                        {businessName(seller).charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-slate-800 truncate">{businessName(seller)}</p>
                                                        <p className="text-xs text-slate-400 truncate">{sellerCode(seller)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="space-y-1">
                                                    <p className="flex items-center gap-1.5 text-xs text-slate-600">
                                                        <FiMail size={12} className="text-slate-400" /> {emailOf(seller) || '—'}
                                                    </p>
                                                    {phoneOf(seller) && (
                                                        <p className="flex items-center gap-1.5 text-xs text-slate-600">
                                                            <FiPhone size={12} className="text-slate-400" /> {phoneOf(seller)}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg capitalize">
                                                    {seller.business_type || 'Individual'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">{getStatusBadge(seller.account_status)}</td>
                                            <td className="px-4 py-4 text-center">{getVerificationBadge(verificationStatus(seller))}</td>
                                            <td className="px-4 py-4 text-center text-xs text-slate-500">
                                                {joinedOf(seller)
                                                    ? new Date(joinedOf(seller)).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
                                                    : 'N/A'}
                                            </td>
                                            <td className="px-4 py-4 sticky right-0 bg-white" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-center items-center gap-2">
                                                    <button
                                                        onClick={() => navigate(`/admin/sellers/${sellerCode(seller)}`)}
                                                        title="View seller"
                                                        className="p-2.5 text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 rounded-lg transition-all"
                                                    >
                                                        <FiEye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/admin/sellers/edit/${sellerCode(seller)}`)}
                                                        title="Edit seller"
                                                        className="p-2.5 text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-all"
                                                    >
                                                        <FiEdit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(seller)}
                                                        title="Delete seller"
                                                        className="p-2.5 text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg transition-all"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    {!loading && sellers.length > 0 && (
                        <div className="grid grid-cols-1 items-center gap-3 border-t border-slate-200 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto]">
                            <p className="text-xs text-slate-500">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalSellers)} of {totalSellers} sellers
                            </p>
                            <div className="flex max-w-full items-center justify-center gap-1 overflow-x-auto pb-1 sm:justify-end">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-sky-200 text-slate-600 disabled:opacity-40 hover:bg-sky-50"
                                >
                                    <FiChevronLeft size={16} />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                    .map((p, idx, arr) => (
                                        <React.Fragment key={p}>
                                            {idx > 0 && p - arr[idx - 1] > 1 && <span className="px-1 text-slate-400">…</span>}
                                            <button
                                                onClick={() => handlePageChange(p)}
                                                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${p === currentPage
                                                    ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md shadow-blue-200'
                                                    : 'border border-sky-200 text-slate-600 hover:bg-sky-50'
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        </React.Fragment>
                                    ))}
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

            {/* DELETE MODAL */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowDeleteModal(false)}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-2xl sm:p-6"
                        >
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                                <FiAlertCircle size={22} className="text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 text-center mt-4">
                                Delete this seller?
                            </h3>
                            <p className="text-sm text-slate-500 text-center mt-2">
                                <strong>{sellerToDelete ? businessName(sellerToDelete) : ''}</strong> will be permanently removed along with:
                            </p>
                            <ul className="text-xs text-slate-500 mt-3 space-y-1 pl-6 list-disc">
                                <li>Linked user account</li>
                                <li>All products</li>
                                <li>All employees</li>
                                <li>All reviews and complaints</li>
                                <li>All order items</li>
                            </ul>
                            <p className="text-xs text-rose-600 text-center mt-3 font-medium">
                                This action cannot be undone.
                            </p>
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-sky-200 text-slate-700 rounded-xl hover:bg-sky-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium"
                                >
                                    Delete Seller
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Sellers;