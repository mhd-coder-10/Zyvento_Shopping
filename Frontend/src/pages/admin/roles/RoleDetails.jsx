
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiShield, FiKey, FiEdit2, FiRefreshCw, FiAlertCircle, FiClock,
    FiUser, FiMail, FiPhone, FiHash, FiLayers, FiActivity, FiCheckCircle,
    FiChevronLeft, FiChevronRight, FiSearch, FiX, FiUsers, FiLock, FiUnlock,
    FiCheck, FiUserCheck
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';

const ROLE_TYPE_LABELS = {
    system: 'System', admin: 'Admin', sub_admin: 'Sub-Admin',
    seller: 'Seller', employee: 'Employee', customer: 'Customer'
};

const ROLE_TYPE_STYLES = {
    system: 'bg-purple-50 text-purple-700 border-purple-200',
    admin: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    sub_admin: 'bg-blue-50 text-blue-700 border-blue-200',
    seller: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    employee: 'bg-teal-50 text-teal-700 border-teal-200',
    customer: 'bg-slate-50 text-slate-600 border-slate-200'
};

const USER_TYPE_LABELS = {
    super_admin: 'Super Admin',
    sub_admin: 'Sub Admin',
    seller: 'Seller',
    seller_employee: 'Seller Employee',
    customer: 'Customer'
};

// ================= INFO ROW =================
const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-sky-50/60 min-w-0">
        <div className="mt-0.5 text-sky-600 shrink-0"><Icon size={16} /></div>
        <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
            <p className="text-sm font-medium text-slate-900 mt-0.5 break-words capitalize">{value || '—'}</p>
        </div>
    </div>
);

// ================= STAT CARD =================
const StatCard = ({ icon, title, value, subtext, color }) => (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sky-100 shadow-sm min-w-0">
        <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1 truncate">{title}</p>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 break-words leading-tight">
                    {value ?? '—'}
                </h3>
                {subtext && <p className="text-[11px] sm:text-xs text-slate-400 mt-1">{subtext}</p>}
            </div>
            <div className={`p-2.5 sm:p-3 rounded-xl shrink-0 ${color}`}>{icon}</div>
        </div>
    </div>
);

// ================= MAIN COMPONENT =================
const RoleDetails = () => {
    const { roleId } = useParams();
    const navigate = useNavigate();

    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    // Assigned Users state
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersPagination, setUsersPagination] = useState({ total: 0, page: 1, limit: 10, total_pages: 1 });
    const [userSearch, setUserSearch] = useState('');
    const [debouncedUserSearch, setDebouncedUserSearch] = useState('');
    const [userPage, setUserPage] = useState(1);

    // ============ FETCH ROLE ============
    const fetchRole = useCallback(async ({ silent = false } = {}) => {
        if (!roleId) return;
        silent ? setRefreshing(true) : setLoading(true);
        setErrorMsg('');

        try {
            const res = await ApiService.getRoleById(roleId);
            const data = res?.data?.data || res?.data || null;
            if (!data || !data._id) {
                setRole(null);
                setErrorMsg('Role not found');
            } else {
                setRole(data);
                if (silent) toast.success('Refreshed');
            }
        } catch (err) {
            setErrorMsg(err?.response?.data?.message || 'Failed to load role');
            setRole(null);
            if (silent) toast.error('Failed to refresh');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [roleId]);

    // ============ FETCH ASSIGNED USERS ============
    const fetchUsers = useCallback(async ({ silent = false } = {}) => {
        if (!roleId) return;
        if (!silent) setUsersLoading(true);
        try {
            const res = await ApiService.getUsersByRole(roleId, {
                page: userPage,
                limit: 10,
                search: debouncedUserSearch || undefined
            });

            const payload = res?.data || {};
            const list = Array.isArray(payload.data) ? payload.data : [];
            const pag = payload.pagination || {};

            setUsers(list);
            setUsersPagination({
                total: pag.total || list.length,
                page: pag.page || userPage,
                limit: pag.limit || 10,
                total_pages: pag.totalPages || pag.total_pages || 1
            });
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to load users');
            setUsers([]);
        } finally {
            setUsersLoading(false);
        }
    }, [roleId, userPage, debouncedUserSearch]);

    useEffect(() => { fetchRole(); }, [fetchRole]);

    useEffect(() => {
        if (activeTab === 'users' && role) fetchUsers();
    }, [activeTab, role, fetchUsers]);

    // Debounce user search
    useEffect(() => {
        const t = setTimeout(() => setDebouncedUserSearch(userSearch), 400);
        return () => clearTimeout(t);
    }, [userSearch]);

    useEffect(() => { setUserPage(1); }, [debouncedUserSearch]);

    // HELPERS
    const initials = (role?.role_name || 'R')
        .split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'R';

    const totalPerms = role?.permission_ids?.length || 0;

    const groupedPerms = (role?.permission_ids || []).reduce((acc, p) => {
        const mod = p?.module_name || 'other';
        if (!acc[mod]) acc[mod] = [];
        acc[mod].push(p);
        return acc;
    }, {});

    const userInitials = (u) => {
        const fn = u?.first_name?.[0] || '';
        const ln = u?.last_name?.[0] || '';
        return (fn + ln).toUpperCase() || 'U';
    };

    // LOADING
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                    <p className="text-slate-700 font-medium">Loading role details...</p>
                </div>
            </div>
        );
    }

    // NOT FOUND
    if (!role) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="bg-white border border-sky-100 rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiAlertCircle size={38} className="text-sky-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Role not found</h2>
                    <p className="text-slate-600 mb-6 text-sm">{errorMsg || 'The requested role could not be loaded.'}</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={() => fetchRole()} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-sky-200 text-slate-800 rounded-xl hover:bg-sky-50 font-medium">
                            <FiRefreshCw size={16} /> Retry
                        </button>
                        <button onClick={() => navigate('/admin/roles')} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">
                            Back to Roles
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <FiActivity size={16} /> },
        { id: 'users', label: 'Assigned Users', icon: <FiUsers size={16} />, badge: usersPagination.total || undefined },
        { id: 'permissions', label: 'Permissions', icon: <FiKey size={16} />, badge: totalPerms || undefined }
    ];

    // ============ RENDER ============
    return (
        <div className="min-h-screen min-w-0 overflow-x-hidden bg-slate-50">

            <AdminTopbar
                title="Role Details"
                subtitle={role.role_name}
                actions={
                    <>
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); fetchRole({ silent: true }); }}
                            disabled={refreshing}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-sky-300 hover:bg-sky-50 sm:px-4 disabled:opacity-60"
                        >
                            <FiRefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                        <button
                            onClick={() => navigate(`/admin/roles`)}
                            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:border-sky-300 hover:bg-sky-50 sm:px-4"
                        >
                            Back
                        </button>
                    </>
                }
            />

            <main className="mx-auto w-full max-w-[1600px] space-y-5 p-4 sm:p-6">

                {/* HERO CARD */}
                <div className="bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-500" />

                    <div className="p-5 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            {/* Icon */}
                            <div className="relative shrink-0 self-center sm:self-auto">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-white text-2xl font-black shadow-lg ring-4 ring-sky-100">
                                    {initials}
                                </div>
                                <span className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-4 border-white ${role.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                                    }`} />
                            </div>

                            {/* Name + info — CENTERED on all screens */}
                            <div className="min-w-0 flex-1 text-center">
                                {/* Title — fixed color */}
                                <h2
                                    className="text-xl sm:text-2xl break-words"
                                    style={{
                                        color: '#0f172a',
                                        WebkitTextFillColor: '#0f172a',
                                        fontWeight: 800,
                                        opacity: 1,
                                        filter: 'none',
                                        mixBlendMode: 'normal',
                                        textShadow: 'none',
                                    }}
                                >
                                    {role.role_name}
                                </h2>

                                <p
                                    className="text-sm font-mono break-words mt-0.5"
                                    style={{
                                        color: '#64748b',
                                        WebkitTextFillColor: '#64748b',
                                        opacity: 1,
                                    }}
                                >
                                    {role.role_key}
                                </p>

                                {/* Badges — CENTERED on all screens */}
                                <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border capitalize ${role.is_active
                                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                            : 'bg-slate-100 text-slate-600 border-slate-200'
                                        }`}>
                                        <span className="w-2 h-2 rounded-full bg-current" />
                                        {role.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${ROLE_TYPE_STYLES[role.role_type] || ROLE_TYPE_STYLES.customer
                                        }`}>
                                        <FiShield size={14} />
                                        {ROLE_TYPE_LABELS[role.role_type] || role.role_type}
                                    </span>
                                    {role.is_system_role ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border bg-purple-100 text-purple-700 border-purple-200">
                                            <FiLock size={14} />
                                            System Role
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border bg-amber-100 text-amber-700 border-amber-200">
                                            <FiEdit2 size={14} />
                                            Custom Role
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Back button — hidden on mobile, shown on desktop */}
                            <div className="shrink-0 self-center sm:self-auto">
                                <button
                                    onClick={() => navigate(`/admin/roles`)}
                                    className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl hover:shadow-lg text-sm font-semibold transition-all"
                                    style={{
                                        background: 'linear-gradient(to right, #2563eb, #0ea5e9)',
                                        color: '#ffffff',
                                        boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
                                    }}
                                >
                                    <FiEdit2 size={16} />
                                    <span>Back to List</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                    <StatCard
                        icon={<FiKey size={20} className="text-indigo-600" />}
                        title="Permissions"
                        value={totalPerms}
                        subtext="Total assigned"
                        color="bg-indigo-100"
                    />
                    <StatCard
                        icon={<FiUsers size={20} className="text-sky-600" />}
                        title="Assigned Users"
                        value={usersPagination.total}
                        subtext="Users with this role"
                        color="bg-sky-100"
                    />
                    <StatCard
                        icon={<FiLayers size={20} className="text-blue-600" />}
                        title="Data Scope"
                        value={role.data_scope === 'all' ? 'All Data' : 'Own Data'}
                        subtext="Access level"
                        color="bg-blue-100"
                    />
                    <StatCard
                        icon={<FiActivity size={20} className="text-emerald-600" />}
                        title="Priority"
                        value={role.priority || 0}
                        subtext="Hierarchy rank"
                        color="bg-emerald-100"
                    />
                </div>

                {/* TABS */}
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
                                {t.badge !== undefined && (
                                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${activeTab === t.id ? 'bg-white/20' : 'bg-slate-100'
                                        }`}>
                                        {t.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="p-4 sm:p-6">

                        {/* OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5"
                            >
                                <div className="space-y-3 text-start ml-4 ">
                                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                        <FiShield className="text-blue-600" /> Role Information
                                    </h3>
                                    <InfoRow icon={FiShield} label="Role Name" value={role.role_name} />
                                    <InfoRow icon={FiHash} label="Role Key" value={role.role_key} />
                                    <InfoRow icon={FiLayers} label="Role Type" value={ROLE_TYPE_LABELS[role.role_type] || role.role_type} />
                                    <InfoRow icon={FiActivity} label="Data Scope" value={role.data_scope === 'all' ? 'All Data' : 'Own Data Only'} />
                                    <InfoRow icon={FiActivity} label="Priority" value={role.priority} />
                                </div>

                                <div className="space-y-3 text-start">
                                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                        <FiClock className="text-blue-600" /> Metadata
                                    </h3>
                                    <InfoRow
                                        icon={FiLock}
                                        label="Role Category"
                                        value={role.is_system_role ? 'System (Protected)' : 'Custom (Editable)'}
                                    />
                                    <InfoRow icon={FiCheckCircle} label="Status" value={role.is_active ? 'Active' : 'Inactive'} />
                                    <InfoRow
                                        icon={FiClock}
                                        label="Created At"
                                        value={role.created_at ? new Date(role.created_at).toLocaleString('en-IN') : '—'}
                                    />
                                    <InfoRow
                                        icon={FiClock}
                                        label="Last Updated"
                                        value={role.updated_at ? new Date(role.updated_at).toLocaleString('en-IN') : '—'}
                                    />
                                </div>

                                {role.description && (
                                    <div className="lg:col-span-2">
                                        <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                            <p className="text-sm text-slate-700">{role.description}</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* ASSIGNED USERS TAB */}
                        {activeTab === 'users' && (
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

                                {/* Search */}
                                <div className="relative">
                                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search users by name, email, code..."
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        className="min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-9 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                    />
                                    {userSearch && (
                                        <button
                                            onClick={() => setUserSearch('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            <FiX size={15} />
                                        </button>
                                    )}
                                </div>

                                {usersLoading ? (
                                    <div className="space-y-3">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="h-20 bg-sky-50 rounded-xl animate-pulse" />
                                        ))}
                                    </div>
                                ) : users.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="p-4 bg-sky-50 rounded-full mb-4 inline-block">
                                            <FiUsers size={28} className="text-sky-500" />
                                        </div>
                                        <h3 className="text-base font-semibold text-slate-800">No users assigned</h3>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {userSearch
                                                ? 'No users match your search'
                                                : 'This role is not assigned to any user yet'}
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            {users.map((u) => (
                                                <div
                                                    key={u._id}
                                                    className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/50 transition-colors"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                                                        {userInitials(u)}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm text-slate-800 truncate">
                                                            {u.first_name} {u.last_name}
                                                        </p>
                                                        <p className="text-xs text-slate-500 truncate">{u.email}</p>
                                                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 font-semibold uppercase">
                                                                {USER_TYPE_LABELS[u.user_type] || u.user_type?.replace(/_/g, ' ')}
                                                            </span>
                                                            {u.user_code && (
                                                                <span className="text-[10px] text-slate-400 font-mono">
                                                                    {u.user_code}
                                                                </span>
                                                            )}
                                                            {u.account_status && (
                                                                <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold capitalize ${u.account_status === 'active'
                                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                        : 'bg-slate-50 text-slate-600 border-slate-200'
                                                                    }`}>
                                                                    {u.account_status}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => navigate(`/admin/users/${u.user_code || u._id}`)}
                                                        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 text-xs font-semibold hover:bg-sky-100 transition-colors"
                                                    >
                                                        <FiUser size={12} /> View
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Pagination */}
                                        {usersPagination.total_pages > 1 && (
                                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                                                <p className="text-xs text-slate-500">
                                                    Showing {users.length} of <b>{usersPagination.total}</b> users
                                                </p>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                                                        disabled={usersPagination.page <= 1}
                                                        className="p-2 rounded-lg border border-sky-200 text-slate-600 disabled:opacity-40 hover:bg-sky-50"
                                                    >
                                                        <FiChevronLeft size={14} />
                                                    </button>
                                                    <span className="text-xs font-medium text-slate-700 px-3">
                                                        Page {usersPagination.page} / {usersPagination.total_pages}
                                                    </span>
                                                    <button
                                                        onClick={() => setUserPage((p) => Math.min(usersPagination.total_pages, p + 1))}
                                                        disabled={usersPagination.page >= usersPagination.total_pages}
                                                        className="p-2 rounded-lg border border-sky-200 text-slate-600 disabled:opacity-40 hover:bg-sky-50"
                                                    >
                                                        <FiChevronRight size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </motion.div>
                        )}

                        {/* PERMISSIONS TAB */}
                        {activeTab === 'permissions' && (
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                                {totalPerms === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="p-4 bg-sky-50 rounded-full mb-4 inline-block">
                                            <FiKey size={28} className="text-sky-500" />
                                        </div>
                                        <h3 className="text-base font-semibold text-slate-800">No permissions assigned</h3>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Use "Manage Permissions" from the roles list to assign permissions
                                        </p>
                                    </div>
                                ) : (
                                    Object.entries(groupedPerms).sort(([a], [b]) => a.localeCompare(b)).map(([module, perms]) => (
                                        <div key={module} className="rounded-xl border border-slate-200 overflow-hidden">
                                            <div className="px-4 py-2.5 bg-gradient-to-r from-sky-50 to-white border-b border-slate-100 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                                                        <FiLayers size={13} className="text-white" />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700 capitalize">
                                                        {module.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-semibold">
                                                    {perms.length}
                                                </span>
                                            </div>
                                            <div className="p-3 flex flex-wrap gap-1.5">
                                                {perms.map((p) => (
                                                    <span
                                                        key={p._id}
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-[11px] font-medium"
                                                        title={`${p.permission_key}`}
                                                    >
                                                        <FiCheck size={10} />
                                                        {p.permission_name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RoleDetails;