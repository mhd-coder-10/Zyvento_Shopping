
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiKey, FiShield, FiRefreshCw, FiAlertCircle, FiClock, FiHash,
    FiLayers, FiActivity, FiCheckCircle, FiChevronLeft, FiChevronRight,
    FiSearch, FiX, FiLock, FiEdit2, FiCheck
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';

const ACTION_LABELS = {
    create: 'Create', read: 'Read', update: 'Update', delete: 'Delete',
    manage: 'Manage', approve: 'Approve', reject: 'Reject',
    export: 'Export', import: 'Import', view_all: 'View All',
    view_own: 'View Own', assign: 'Assign', revoke: 'Revoke'
};

const ACTION_STYLES = {
    create: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    read: 'bg-sky-50 text-sky-700 border-sky-200',
    update: 'bg-amber-50 text-amber-700 border-amber-200',
    delete: 'bg-rose-50 text-rose-700 border-rose-200',
    manage: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    approve: 'bg-teal-50 text-teal-700 border-teal-200',
    reject: 'bg-orange-50 text-orange-700 border-orange-200',
    export: 'bg-violet-50 text-violet-700 border-violet-200',
    assign: 'bg-cyan-50 text-cyan-700 border-cyan-200'
};

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
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 break-words leading-tight capitalize">
                    {value ?? '—'}
                </h3>
                {subtext && <p className="text-[11px] sm:text-xs text-slate-400 mt-1">{subtext}</p>}
            </div>
            <div className={`p-2.5 sm:p-3 rounded-xl shrink-0 ${color}`}>{icon}</div>
        </div>
    </div>
);

// ================= MAIN COMPONENT =================
const PermissionDetails = () => {
    const { permissionId } = useParams();
    const navigate = useNavigate();

    const [permission, setPermission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    // Roles using this permission
    const [roles, setRoles] = useState([]);
    const [rolesLoading, setRolesLoading] = useState(false);
    const [rolesPagination, setRolesPagination] = useState({ total: 0, page: 1, limit: 10, total_pages: 1 });
    const [roleSearch, setRoleSearch] = useState('');
    const [debouncedRoleSearch, setDebouncedRoleSearch] = useState('');
    const [rolePage, setRolePage] = useState(1);

    // FETCH PERMISSION
    const fetchPermission = useCallback(async ({ silent = false } = {}) => {
        if (!permissionId) return;
        silent ? setRefreshing(true) : setLoading(true);
        setErrorMsg('');

        try {
            const res = await ApiService.getPermissionById(permissionId);
            const data = res?.data?.data || res?.data || null;
            if (!data || !data._id) {
                setPermission(null);
                setErrorMsg('Permission not found');
            } else {
                setPermission(data);
                if (silent) toast.success('Refreshed');
            }
        } catch (err) {
            setErrorMsg(err?.response?.data?.message || 'Failed to load permission');
            setPermission(null);
            if (silent) toast.error('Failed to refresh');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [permissionId]);

    // FETCH ROLES USING THIS PERMISSION
    const fetchRoles = useCallback(async ({ silent = false } = {}) => {
        if (!permissionId) return;
        if (!silent) setRolesLoading(true);
        try {
            const res = await ApiService.getRolesByPermission(permissionId, {
                page: rolePage,
                limit: 10,
                search: debouncedRoleSearch || undefined
            });

            const payload = res?.data || {};
            const list = Array.isArray(payload.data) ? payload.data : [];
            const pag = payload.pagination || {};

            setRoles(list);
            setRolesPagination({
                total: pag.total || list.length,
                page: pag.page || rolePage,
                limit: pag.limit || 10,
                total_pages: pag.totalPages || pag.total_pages || 1
            });
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to load roles');
            setRoles([]);
        } finally {
            setRolesLoading(false);
        }
    }, [permissionId, rolePage, debouncedRoleSearch]);

    useEffect(() => { fetchPermission(); }, [fetchPermission]);

    useEffect(() => {
        if (activeTab === 'roles' && permission) fetchRoles();
    }, [activeTab, permission, fetchRoles]);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedRoleSearch(roleSearch), 400);
        return () => clearTimeout(t);
    }, [roleSearch]);

    useEffect(() => { setRolePage(1); }, [debouncedRoleSearch]);

    // HELPERS
    const initials = (permission?.permission_name || 'P')
        .split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'P';

    // LOADING
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                    <p className="text-slate-700 font-medium">Loading permission details...</p>
                </div>
            </div>
        );
    }

    // NOT FOUND
    if (!permission) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="bg-white border border-sky-100 rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiAlertCircle size={38} className="text-sky-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Permission not found</h2>
                    <p className="text-slate-600 mb-6 text-sm">{errorMsg || 'The requested permission could not be loaded.'}</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={() => fetchPermission()} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-sky-200 text-slate-800 rounded-xl hover:bg-sky-50 font-medium">
                            <FiRefreshCw size={16} /> Retry
                        </button>
                        <button onClick={() => navigate('/admin/permissions')} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">
                            Back to Permissions
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <FiActivity size={16} /> },
        { id: 'roles', label: 'Used By Roles', icon: <FiShield size={16} />, badge: rolesPagination.total || undefined }
    ];

    // RENDER
    return (
        <div className="min-h-screen min-w-0 overflow-x-hidden bg-slate-50">

            {/* Header */}
            <AdminTopbar
                title="Permission Details"
                subtitle={permission.permission_name}
                actions={
                    <>
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); fetchPermission({ silent: true }); }}
                            disabled={refreshing}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-sky-300 hover:bg-sky-50 sm:px-4 disabled:opacity-60"
                        >
                            <FiRefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                        <button
                            onClick={() => navigate('/admin/permissions')}
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
                    <div className="h-1.5 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500" />

                    <div className="p-5 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            {/* Icon */}
                            <div className="relative shrink-0 self-center sm:self-auto">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-2xl font-black shadow-lg ring-4 ring-sky-100">
                                    {initials}
                                </div>
                                <span className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-4 border-white ${permission.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                                    }`} />
                            </div>

                            {/* Name + Info */}
                            <div className="min-w-0 flex-1 text-center">
                                <h2
                                    className="text-xl sm:text-2xl break-words"
                                    style={{
                                        color: '#0f172a',
                                        WebkitTextFillColor: '#0f172a',
                                        fontWeight: 800,
                                        opacity: 1,
                                        filter: 'none',
                                        mixBlendMode: 'normal',
                                    }}
                                >
                                    {permission.permission_name}
                                </h2>
                                <p
                                    className="text-sm font-mono break-words mt-0.5"
                                    style={{ color: '#64748b', WebkitTextFillColor: '#64748b' }}
                                >
                                    {permission.permission_key}
                                </p>

                                <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border capitalize ${permission.is_active
                                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                        : 'bg-slate-100 text-slate-600 border-slate-200'
                                        }`}>
                                        <span className="w-2 h-2 rounded-full bg-current" />
                                        {permission.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border capitalize ${ACTION_STYLES[permission.action] || ACTION_STYLES.read
                                        }`}>
                                        <FiActivity size={14} />
                                        {ACTION_LABELS[permission.action] || permission.action}
                                    </span>
                                    {permission.is_system && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border bg-purple-100 text-purple-700 border-purple-200">
                                            <FiLock size={14} />
                                            System Permission
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Back to list button (desktop only) */}
                            <div className="shrink-0 self-center sm:self-auto">
                                <button
                                    onClick={() => navigate('/admin/permissions')}
                                    className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl hover:shadow-lg text-sm font-semibold transition-all"
                                    style={{
                                        background: 'linear-gradient(to right, #0ea5e9, #6366f1)',
                                        color: '#ffffff',
                                        boxShadow: '0 10px 15px -3px rgba(14, 165, 233, 0.3)'
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
                        icon={<FiShield size={20} className="text-indigo-600" />}
                        title="Used By Roles"
                        value={rolesPagination.total}
                        subtext="Roles with this permission"
                        color="bg-indigo-100"
                    />
                    <StatCard
                        icon={<FiLayers size={20} className="text-sky-600" />}
                        title="Module"
                        value={permission.module_name?.replace(/_/g, ' ') || '—'}
                        subtext="Belongs to"
                        color="bg-sky-100"
                    />
                    <StatCard
                        icon={<FiActivity size={20} className="text-blue-600" />}
                        title="Action"
                        value={ACTION_LABELS[permission.action] || permission.action || '—'}
                        subtext="What it does"
                        color="bg-blue-100"
                    />
                    <StatCard
                        icon={<FiKey size={20} className="text-emerald-600" />}
                        title="Priority"
                        value={permission.priority || 0}
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
                                {/* Permission Info */}
                                <div className="space-y-3 text-start">
                                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                        <FiKey className="text-blue-600" /> Permission Info
                                    </h3>
                                    <InfoRow icon={FiKey} label="Permission Name" value={permission.permission_name} />
                                    <InfoRow icon={FiHash} label="Permission Key" value={permission.permission_key} />
                                    <InfoRow icon={FiLayers} label="Module" value={permission.module_name?.replace(/_/g, ' ')} />
                                    <InfoRow icon={FiActivity} label="Action" value={ACTION_LABELS[permission.action] || permission.action} />
                                    <InfoRow icon={FiActivity} label="Priority" value={permission.priority} />
                                </div>

                                {/* Metadata */}
                                <div className="space-y-3 text-start">
                                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                        <FiClock className="text-blue-600" /> Metadata
                                    </h3>
                                    <InfoRow
                                        icon={FiLock}
                                        label="Permission Category"
                                        value={permission.is_system ? 'System (Protected)' : 'Custom (Editable)'}
                                    />
                                    <InfoRow icon={FiCheckCircle} label="Status" value={permission.is_active ? 'Active' : 'Inactive'} />
                                    <InfoRow
                                        icon={FiClock}
                                        label="Created At"
                                        value={permission.created_at ? new Date(permission.created_at).toLocaleString('en-IN') : '—'}
                                    />
                                    <InfoRow
                                        icon={FiClock}
                                        label="Last Updated"
                                        value={permission.updated_at ? new Date(permission.updated_at).toLocaleString('en-IN') : '—'}
                                    />
                                </div>

                                {/* description */}
                                {permission.description && (
                                    <div className="lg:col-span-2">
                                        <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                            <p className="text-sm text-slate-700">{permission.description}</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Used By ROLES TAB */}
                        {activeTab === 'roles' && (
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

                                {/* Search */}
                                <div className="relative">
                                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search roles by name, key..."
                                        value={roleSearch}
                                        onChange={(e) => setRoleSearch(e.target.value)}
                                        className="min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-9 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                    />
                                    {roleSearch && (
                                        <button
                                            onClick={() => setRoleSearch('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            <FiX size={15} />
                                        </button>
                                    )}
                                </div>

                                {rolesLoading ? (
                                    <div className="space-y-3">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="h-24 bg-sky-50 rounded-xl animate-pulse" />
                                        ))}
                                    </div>
                                ) : roles.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="p-4 bg-sky-50 rounded-full mb-4 inline-block">
                                            <FiShield size={28} className="text-sky-500" />
                                        </div>
                                        <h3 className="text-base font-semibold text-slate-800">No roles use this permission</h3>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {roleSearch
                                                ? 'No roles match your search'
                                                : 'This permission is not assigned to any role yet'}
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            {roles.map((r) => (
                                                <div
                                                    key={r._id}
                                                    className="p-3 sm:p-4 rounded-xl border border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/50 transition-colors"
                                                >
                                                    {/* TOP ROW: Icon + Name + Key + View button */}
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0">
                                                            <FiShield size={18} />
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-sm text-slate-800 truncate">
                                                                {r.role_name}
                                                            </p>
                                                            <p className="text-xs text-slate-500 font-mono truncate">
                                                                {r.role_key}
                                                            </p>
                                                        </div>

                                                        <button
                                                            onClick={() => navigate(`/admin/roles/${r._id}`)}
                                                            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 text-xs font-semibold hover:bg-sky-100 transition-colors"
                                                        >
                                                            <FiShield size={12} /> View
                                                        </button>
                                                    </div>

                                                    {/* BOTTOM ROW: Badges centered */}
                                                    <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${ROLE_TYPE_STYLES[r.role_type] || ROLE_TYPE_STYLES.customer
                                                            }`}>
                                                            {ROLE_TYPE_LABELS[r.role_type] || r.role_type}
                                                        </span>
                                                        {r.is_system_role && (
                                                            <span className="text-[10px] px-2 py-0.5 rounded-md border bg-purple-50 text-purple-700 border-purple-200 font-semibold">
                                                                System
                                                            </span>
                                                        )}
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold capitalize ${r.is_active
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : 'bg-slate-50 text-slate-600 border-slate-200'
                                                            }`}>
                                                            {r.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Pagination */}
                                        {rolesPagination.total_pages > 1 && (
                                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                                                <p className="text-xs text-slate-500">
                                                    Showing {roles.length} of <b>{rolesPagination.total}</b> roles
                                                </p>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => setRolePage((p) => Math.max(1, p - 1))}
                                                        disabled={rolesPagination.page <= 1}
                                                        className="p-2 rounded-lg border border-sky-200 text-slate-600 disabled:opacity-40 hover:bg-sky-50"
                                                    >
                                                        <FiChevronLeft size={14} />
                                                    </button>
                                                    <span className="text-xs font-medium text-slate-700 px-3">
                                                        Page {rolesPagination.page} / {rolesPagination.total_pages}
                                                    </span>
                                                    <button
                                                        onClick={() => setRolePage((p) => Math.min(rolesPagination.total_pages, p + 1))}
                                                        disabled={rolesPagination.page >= rolesPagination.total_pages}
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

                    </div>
                </div>
            </main>
        </div>
    );
};

export default PermissionDetails;