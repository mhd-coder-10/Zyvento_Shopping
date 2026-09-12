
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiPlus, FiEye, FiEdit2, FiTrash2, FiSearch,
    FiDownload, FiRefreshCw, FiChevronLeft, FiChevronRight,
    FiMail, FiPhone, FiShield, FiUser, FiX, FiUsers, FiAlertCircle
} from 'react-icons/fi';
import { FaUserCircle, FaStore, FaUserTag, FaUsersCog } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import ApiService from '../../../api/ApiService';

/* ================= MAIN FILTER OPTIONS ================= */
const MAIN_USER_TYPES = [
    { value: 'all', label: 'All Types' },
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'sub_admin', label: 'Sub Admin (Platform Staff)' },
    { value: 'seller', label: 'Sellers' },
    { value: 'seller_employee', label: 'Employees' },
    { value: 'customer', label: 'Customers' },
];

const SUB_ADMIN_TYPES = [
    { value: 'all', label: 'All Sub-Admin Types' },
    { value: 'manager', label: 'Manager' },
    { value: 'finance_manager', label: 'Finance Manager' },
    { value: 'support_manager', label: 'Support Manager' },
    { value: 'seller_manager', label: 'Seller Manager' },
];

const EMPLOYEE_TYPES = [
    { value: 'all', label: 'All Employee Types' },
    { value: 'manager', label: 'Manager' },
    { value: 'product_manager', label: 'Product Manager' },
    { value: 'order_manager', label: 'Order Manager' },
    { value: 'inventory_manager', label: 'Inventory Manager' },
    { value: 'support_staff', label: 'Support Staff' },
    { value: 'account_manager', label: 'Account Manager' },
];

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'pending', label: 'Pending' },
];

/* ================= HELPERS ================= */
const uid = (u) => u?._id || u?.id || '';
const userCode = (u) => u?.user_code || uid(u);
const fullName = (u) => `${u?.first_name || ''} ${u?.last_name || ''}`.trim() || u?.username || 'Unnamed';
const emailOf = (u) => u?.email || '';
const phoneOf = (u) => u?.mobile_number || u?.phone || '';
const joinedOf = (u) => u?.created_at || u?.createdAt || null;

const isActiveUser = (u) => String(u?.account_status || '').toLowerCase() === 'active';

const getStatusBadge = (status) => {
    const map = {
        active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        inactive: 'bg-slate-50 text-slate-600 border-slate-200',
        blocked: 'bg-rose-50 text-rose-700 border-rose-200',
        pending: 'bg-amber-50 text-amber-700 border-amber-200',
        deleted: 'bg-slate-100 text-slate-500 border-slate-200',
    };
    const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${map[status] || map.inactive}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            {label}
        </span>
    );
};

const getRoleBadge = (user) => {
    const type = user?.user_type;
    const sub = user?.sub_admin_type;
    const emp = user?.employee_type;

    if (type === 'super_admin') {
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 text-[11px] font-semibold"><FaUsersCog size={11} /> Super Admin</span>;
    }
    if (type === 'sub_admin') {
        const label = sub ? sub.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Sub Admin';
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-[11px] font-semibold"><FiShield size={11} /> {label}</span>;
    }
    if (type === 'seller') {
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-sky-200 bg-sky-50 text-sky-700 text-[11px] font-semibold"><FaStore size={11} /> Seller</span>;
    }
    if (type === 'seller_employee') {
        const label = emp ? emp.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Employee';
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-teal-200 bg-teal-50 text-teal-700 text-[11px] font-semibold"><FaUserTag size={11} /> {label}</span>;
    }
    if (type === 'customer') {
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-[11px] font-semibold"><FiUser size={11} /> Customer</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-600 text-[11px] font-semibold"><FaUserCircle size={11} /> User</span>;
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
            <FiUsers size={28} className="text-sky-500" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">No users found</h3>
        <p className="text-sm text-slate-500 mt-1">Try changing your filters or search.</p>
        {onClear && (
            <button onClick={onClear} className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50">
                Clear all filters
            </button>
        )}
    </div>
);

/* ================= MAIN COMPONENT ================= */
const Users = () => {
    const navigate = useNavigate();

    // Data state
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [userTypeFilter, setUserTypeFilter] = useState('all');
    const [subAdminTypeFilter, setSubAdminTypeFilter] = useState('all');
    const [employeeTypeFilter, setEmployeeTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const itemsPerPage = 10;

    // Delete modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // Debounced search
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
        return () => clearTimeout(t);
    }, [searchQuery]);

    // ========== FETCH USERS ==========
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setLoadError('');
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
            };
            if (debouncedSearch) params.search = debouncedSearch;
            if (userTypeFilter && userTypeFilter !== 'all') params.user_type = userTypeFilter;
            if (subAdminTypeFilter && subAdminTypeFilter !== 'all' && userTypeFilter === 'sub_admin') {
                params.sub_admin_type = subAdminTypeFilter;
            }
            if (employeeTypeFilter && employeeTypeFilter !== 'all' && userTypeFilter === 'seller_employee') {
                params.employee_type = employeeTypeFilter;
            }
            if (statusFilter && statusFilter !== 'all') params.account_status = statusFilter;

            const res = await ApiService.getAllUsers(params);
            const payload = res?.data || {};

            // Handle both `data` array and `data.data` array response shapes
            const list = Array.isArray(payload.data) ? payload.data : (payload.data?.users || payload.users || []);
            const pag = payload.pagination || payload.data?.pagination || {};

            setUsers(list);
            setTotalPages(pag.totalPages || 1);
            setTotalUsers(pag.total || list.length);
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
            setLoadError(error?.response?.data?.message || error?.message || 'Failed to fetch users');
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage, debouncedSearch, userTypeFilter, subAdminTypeFilter, employeeTypeFilter, statusFilter]);

    // ========== FETCH STATS ==========
    const fetchStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const res = await ApiService.getUserStats();
            const payload = res?.data?.data || res?.data || null;
            if (payload) setStats(payload);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setStatsLoading(false);
        }
    }, []);

    // Initial + filter change
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Initial stats
    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [userTypeFilter, subAdminTypeFilter, employeeTypeFilter, statusFilter, debouncedSearch]);

    // Reset sub-filters when main type changes
    useEffect(() => {
        setSubAdminTypeFilter('all');
        setEmployeeTypeFilter('all');
    }, [userTypeFilter]);

    // ========== HANDLERS ==========
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;
        try {
            await ApiService.deleteUserByAdmin(userCode(userToDelete));
            toast.success('User deleted successfully');
            setShowDeleteModal(false);
            setUserToDelete(null);
            fetchUsers();
            fetchStats();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleExport = () => {
        const headers = ['User Code', 'Name', 'Email', 'Phone', 'Type', 'Sub-Type', 'Status', 'Joined'];

        const rows = users.map((u) => [
            userCode(u),
            fullName(u),
            emailOf(u),
            phoneOf(u),
            u.user_type || '',
            u.sub_admin_type || u.employee_type || '',
            u.account_status || '',
            joinedOf(u) ? new Date(joinedOf(u)).toLocaleDateString('en-IN') : '',
        ]);

        const csv = [
            headers.join(','),
            ...rows.map((r) =>
                r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')
            ),
        ].join('\n');

        const url = window.URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Users exported');
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setUserTypeFilter('all');
        setSubAdminTypeFilter('all');
        setEmployeeTypeFilter('all');
        setStatusFilter('all');
        setCurrentPage(1);
    };

    const activeFilterCount =
        (userTypeFilter !== 'all' ? 1 : 0) +
        (subAdminTypeFilter !== 'all' ? 1 : 0) +
        (employeeTypeFilter !== 'all' ? 1 : 0) +
        (statusFilter !== 'all' ? 1 : 0) +
        (searchQuery ? 1 : 0);

    const showSubAdminDropdown = userTypeFilter === 'sub_admin';
    const showEmployeeDropdown = userTypeFilter === 'seller_employee';

    // ========== RENDER ==========
    return (
        <div className="min-h-screen min-w-0 overflow-x-hidden bg-slate-50">
            <AdminTopbar
                title="User Management"
                subtitle="Manage all customers, vendors, employees & admins"
                actions={
                    <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center lg:justify-end">
                        <button
                            onClick={() => { fetchUsers(); fetchStats(); }}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-sky-300 hover:bg-sky-50 sm:px-4"
                        >
                            <FiRefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
                        </button>

                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-all shadow-sm"
                        >
                            <FiDownload className="w-4 h-4" /> Export
                        </button>

                        <button
                            onClick={() => navigate('/admin/users/create')}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-blue-700 hover:to-sky-600 sm:px-5"
                        >
                            <FiPlus size={16} /> Add User
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

                {/* SUMMARY CARDS */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
                    <StatCard
                        icon={<FiUsers size={18} className="text-blue-600" />}
                        title="Total Users"
                        value={statsLoading ? '—' : (stats?.totalUsers ?? 0)}
                        subtext={stats ? `${stats.activeUsers || 0} active • ${stats.inactiveUsers || 0} inactive` : 'Loading...'}
                        color="bg-blue-100"
                        accent="bg-blue-500"
                    />
                    <StatCard
                        icon={<FiShield size={18} className="text-indigo-600" />}
                        title="Admins"
                        value={statsLoading ? '—' : ((stats?.superAdmins || 0) + (stats?.subAdmins || 0))}
                        subtext={stats ? `${stats.superAdmins || 0} Super • ${stats.subAdmins || 0} Sub` : 'Loading...'}
                        color="bg-indigo-100"
                        accent="bg-indigo-500"
                    />
                    <StatCard
                        icon={<FaStore size={18} className="text-sky-600" />}
                        title="Sellers"
                        value={statsLoading ? '—' : (stats?.sellers ?? 0)}
                        subtext="Registered vendors"
                        color="bg-sky-100"
                        accent="bg-sky-500"
                    />
                    <StatCard
                        icon={<FaUserTag size={18} className="text-teal-600" />}
                        title="Employees"
                        value={statsLoading ? '—' : (stats?.sellerEmployees ?? 0)}
                        subtext="Seller staff"
                        color="bg-teal-100"
                        accent="bg-teal-500"
                    />
                    <StatCard
                        icon={<FiUser size={18} className="text-emerald-600" />}
                        title="Customers"
                        value={statsLoading ? '—' : (stats?.customers ?? 0)}
                        subtext="Registered buyers"
                        color="bg-emerald-100"
                        accent="bg-emerald-500"
                    />
                </div>

                {/* FILTERS + TABLE */}
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    {/* FILTER TOOLBAR */}
                    <div className="border-b border-slate-200 p-4 sm:p-5">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {/* Search */}
                            <div className="relative min-w-0 sm:col-span-2 xl:col-span-1">
                                <FiSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={searchQuery}
                                    placeholder="Search name, email, code..."
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

                            {/* Main Type */}
                            <select
                                value={userTypeFilter}
                                onChange={(e) => setUserTypeFilter(e.target.value)}
                                className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                {MAIN_USER_TYPES.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>

                            {/* Sub-Type (conditional) */}
                            {showSubAdminDropdown ? (
                                <select
                                    value={subAdminTypeFilter}
                                    onChange={(e) => setSubAdminTypeFilter(e.target.value)}
                                    className="min-h-11 w-full rounded-lg border border-blue-300 bg-blue-50 px-3 py-2.5 text-sm text-blue-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    {SUB_ADMIN_TYPES.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            ) : showEmployeeDropdown ? (
                                <select
                                    value={employeeTypeFilter}
                                    onChange={(e) => setEmployeeTypeFilter(e.target.value)}
                                    className="min-h-11 w-full rounded-lg border border-teal-300 bg-teal-50 px-3 py-2.5 text-sm text-teal-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                >
                                    {EMPLOYEE_TYPES.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="hidden xl:block" />
                            )}

                            {/* Status */}
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                {STATUS_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Active filter pills */}
                        {activeFilterCount > 0 && (
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className="text-xs text-slate-500">Active filters:</span>
                                {userTypeFilter !== 'all' && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                        {MAIN_USER_TYPES.find(o => o.value === userTypeFilter)?.label}
                                        <button onClick={() => setUserTypeFilter('all')} className="hover:text-blue-900"><FiX size={12} /></button>
                                    </span>
                                )}
                                {subAdminTypeFilter !== 'all' && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                        {SUB_ADMIN_TYPES.find(o => o.value === subAdminTypeFilter)?.label}
                                        <button onClick={() => setSubAdminTypeFilter('all')} className="hover:text-blue-900"><FiX size={12} /></button>
                                    </span>
                                )}
                                {employeeTypeFilter !== 'all' && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                                        {EMPLOYEE_TYPES.find(o => o.value === employeeTypeFilter)?.label}
                                        <button onClick={() => setEmployeeTypeFilter('all')} className="hover:text-teal-900"><FiX size={12} /></button>
                                    </span>
                                )}
                                {statusFilter !== 'all' && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                        Status: {STATUS_OPTIONS.find(o => o.value === statusFilter)?.label}
                                        <button onClick={() => setStatusFilter('all')} className="hover:text-emerald-900"><FiX size={12} /></button>
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
                                <div key={i} className="h-28 bg-sky-50 rounded-xl animate-pulse" />
                            ))
                        ) : users.length === 0 ? (
                            <EmptyState onClear={activeFilterCount ? handleClearFilters : null} />
                        ) : (
                            users.map((user) => (
                                <div key={uid(user)} className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="w-11 h-11 mt-1 rounded-full bg-gradient-to-r from-blue-600 to-sky-500 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                                            {fullName(user).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                                        </div>
                                        <div className="flex-1 text-left min-w-0 pl-6">
                                            <p className="font-semibold text-slate-800 truncate">{fullName(user)}</p>
                                            <p className="text-xs text-slate-500 truncate">{emailOf(user)}</p>
                                            <div className="flex flex-wrap items-center gap-1.5 mt-4">
                                                {getRoleBadge(user)}
                                                {getStatusBadge(user.account_status)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-slate-100 pt-3 text-start">
                                        <span className="text-xs text-slate-400">
                                            {joinedOf(user) ? new Date(joinedOf(user)).toLocaleDateString() : 'N/A'}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => navigate(`/admin/users/${userCode(user)}`)} title="View" className="p-2 text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 rounded-lg">
                                                <FiEye size={15} />
                                            </button>
                                            <button onClick={() => navigate(`/admin/users/edit/${userCode(user)}`)} title="Edit" className="p-2 text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg">
                                                <FiEdit2 size={15} />
                                            </button>
                                            <button onClick={() => handleDeleteClick(user)} title="Delete" className="p-2 text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg">
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
                        <table className="w-full min-w-[1000px]">
                            <thead className="bg-sky-50/60">
                                <tr>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                                    <th className="px-4 py-3 pl-8 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Contact</th>
                                    <th className="px-4 py-3 pr-12 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                                    <th className="px-4 py-3 pr-8 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                                    <th className="px-4 py-3 pr-8 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Joined</th>
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
                                ) : users.length === 0 ? (
                                    <tr><td colSpan={7}><EmptyState onClear={activeFilterCount ? handleClearFilters : null} /></td></tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={uid(user)} className="hover:bg-sky-50/40 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-sky-500 text-white flex items-center justify-center text-xs font-semibold">
                                                        {fullName(user).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-slate-800 truncate">{fullName(user)}</p>
                                                        <p className="text-xs text-slate-400 truncate">
                                                            @{user.username || emailOf(user).split('@')[0] || 'user'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="space-y-1">
                                                    <p className="flex items-center gap-1.5 text-xs text-slate-600">
                                                        <FiMail size={12} className="text-slate-400" /> {emailOf(user) || '—'}
                                                    </p>
                                                    {phoneOf(user) && (
                                                        <p className="flex items-center gap-1.5 text-xs text-slate-600">
                                                            <FiPhone size={12} className="text-slate-400" /> {phoneOf(user)}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">{getRoleBadge(user)}</td>
                                            <td className="px-4 py-4">{getStatusBadge(user.account_status)}</td>
                                            <td className="px-4 py-4 text-xs text-slate-500">
                                                {joinedOf(user) ? new Date(joinedOf(user)).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                            </td>
                                            <td className="px-4 py-4 sticky right-0 bg-white">
                                                <div className="flex justify-end items-center gap-2">
                                                    <button onClick={() => navigate(`/admin/users/${userCode(user)}`)} title="View user" className="p-2.5 text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 rounded-lg transition-all">
                                                        <FiEye size={16} />
                                                    </button>
                                                    <button onClick={() => navigate(`/admin/users/edit/${userCode(user)}`)} title="Edit user" className="p-2.5 text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-all">
                                                        <FiEdit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteClick(user)} title="Delete user" className="p-2.5 text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg transition-all">
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
                    {!loading && users.length > 0 && (
                        <div className="grid grid-cols-1 items-center gap-3 border-t border-slate-200 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto]">
                            <p className="text-xs text-slate-500">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                                {Math.min(currentPage * itemsPerPage, totalUsers)} of{' '}
                                {totalUsers} users
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
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowDeleteModal(false)}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-2xl sm:p-6"
                        >
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                                <FiAlertCircle size={22} className="text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 text-center mt-4">Delete this user?</h3>
                            <p className="text-sm text-slate-500 text-center mt-2">
                                {userToDelete ? fullName(userToDelete) : ''} will be marked as deleted. This action can be reverted by admin later.
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
                                    Delete User
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Users;