
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiShield, FiKey, FiSearch, FiRefreshCw, FiPlus, FiEdit2, FiTrash2,
    FiChevronLeft, FiChevronRight, FiX, FiLayers, FiLock, FiUnlock,
    FiFilter, FiAlertCircle, FiEye, FiUsers
} from 'react-icons/fi';

import { motion, AnimatePresence } from 'framer-motion';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import RoleFormModal from '../../../components/admin/role/RoleFormModal';
import PermissionFormModal from '../../../components/admin/role/PermissionFormModal';
import ManagePermissionsModal from '../../../components/admin/role/ManagePermissionsModal';

// CONSTANTS
const ROLE_TYPE_LABELS = {
    system: 'System',
    admin: 'Admin',
    sub_admin: 'Sub-Admin',
    seller: 'Seller',
    employee: 'Employee',
    customer: 'Customer'
};

const ROLE_TYPE_STYLES = {
    system: 'bg-purple-50 text-purple-700 border-purple-200',
    admin: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    sub_admin: 'bg-blue-50 text-blue-700 border-blue-200',
    seller: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    employee: 'bg-teal-50 text-teal-700 border-teal-200',
    customer: 'bg-slate-50 text-slate-600 border-slate-200'
};

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

// ROLE CARD
const RoleCard = ({ role, onView, onManagePermissions, onEdit, onToggle, onDelete }) => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col h-full">

        {/* HEADER */}
        <div className="flex items-start gap-2.5 mb-3">

            {/* --- Icon (fixed 40px, both desktop + mobile) --- */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shrink-0">
                <FiShield className="w-5 h-5 text-white" />
            </div>

            {/* --- Name + Key (grows, min-w-0 for text wrap) --- */}
            {/* DESKTOP: text-base  |  MOBILE: text-sm (smaller) */}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm sm:text-[15px] leading-tight line-clamp-2 break-words">
                    {role.role_name}
                </p>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono truncate mt-0.5">
                    {role.role_key}
                </p>
            </div>

            {/* --- Status Badge (top-right, both desktop + mobile) --- */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-semibold shrink-0 ${role.is_active
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {role.is_active ? 'Active' : 'Inactive'}
            </span>
        </div>

        {/* DESCRIPTION */}
        <p className="text-xs text-slate-500 mb-3 line-clamp-2 min-h-[32px]">
            {role.description || 'No description'}
        </p>

        {/* BADGES (Type / Permissions / System or Custom) */}
        <div className="flex justify-center sm:justify-start flex-wrap gap-1.5 mb-4">
            <span className={`inline-flex px-2 py-0.5 rounded-md border text-[10px] font-semibold ${ROLE_TYPE_STYLES[role.role_type] || ROLE_TYPE_STYLES.customer
                }`}>
                {ROLE_TYPE_LABELS[role.role_type] || role.role_type}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-semibold">
                <FiKey size={10} />
                {role.permission_ids?.length || 0} Permissions
            </span>
            {role.is_system_role ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-semibold">
                    <FiLock size={10} />
                    System
                </span>
            ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold">
                    <FiEdit2 size={10} />
                    Custom
                </span>
            )}
        </div>

        {/* ACTIONS (bottom section — pushed to card bottom) */}
        <div className="border-t border-slate-100 mt-auto pt-3">

            {/* Manage Permissions — Full width button */}
            <button
                onClick={() => onManagePermissions(role)}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 text-xs font-semibold hover:bg-sky-100 transition-colors whitespace-nowrap overflow-hidden"
            >
                <FiKey size={13} className="shrink-0" />
                <span className="truncate">Manage Permissions</span>
            </button>

            {/* Action Icons Row — centered */}
            <div className="flex items-center justify-center gap-1 mt-2">

                {/* View */}
                <button
                    onClick={() => onView(role)}
                    title="View Details"
                    className="p-2 rounded-lg text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                >
                    <FiEye size={16} />
                </button>

                {/* Edit — enabled for ALL roles */}
                <button
                    onClick={() => onEdit(role)}
                    title="Edit Role"
                    className="p-2 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                    <FiEdit2 size={16} />
                </button>

                {/* Toggle Active/Inactive — enabled for ALL roles */}
                <button
                    onClick={() => onToggle(role)}
                    title={role.is_active ? 'Deactivate' : 'Activate'}
                    className={`p-2 rounded-lg transition-colors ${role.is_active
                        ? 'text-slate-500 hover:bg-orange-50 hover:text-orange-600'
                        : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
                        }`}
                >
                    {role.is_active ? <FiLock size={16} /> : <FiUnlock size={16} />}
                </button>

                {/* Delete — only for CUSTOM roles */}
                {!role.is_system_role ? (
                    <button
                        onClick={() => onDelete(role)}
                        title="Delete"
                        className="p-2 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                        <FiTrash2 size={16} />
                    </button>
                ) : (
                    <button
                        disabled
                        title="System roles cannot be deleted"
                        className="p-2 rounded-lg text-slate-300 cursor-not-allowed"
                    >
                        <FiTrash2 size={16} />
                    </button>
                )}
            </div>
        </div>
    </div>
);

// PERMISSION CARD 
const PermissionCard = ({ permission, onView, onEdit, onToggle, onDelete }) => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-start gap-3 hover:shadow-md transition-shadow">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-sm shrink-0">
            <FiKey className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2 mb-1">
                <p className="font-medium text-sm text-slate-800 truncate">{permission.permission_name}</p>
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-semibold shrink-0 ${permission.is_active
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                    {permission.is_active ? 'Active' : 'Inactive'}
                </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono truncate mb-2">{permission.permission_key}</p>
            <div className="flex flex-wrap items-center gap-1.5">
                <span className={`inline-flex px-2 py-0.5 rounded-md border text-[10px] font-semibold capitalize ${ACTION_STYLES[permission.action] || ACTION_STYLES.read
                    }`}>
                    {ACTION_LABELS[permission.action] || permission.action}
                </span>

                <div className="flex items-center gap-1 ml-auto">
                    {/* View — always visible */}
                    <button
                        onClick={() => onView(permission)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-sky-50 hover:text-sky-600"
                        title="View"
                    >
                        <FiEye size={12} />
                    </button>

                    {/* ✅ Edit — ALWAYS visible (system + custom) */}
                    <button
                        onClick={() => onEdit(permission)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                        title="Edit"
                    >
                        <FiEdit2 size={12} />
                    </button>

                    {/* Toggle + Delete — only for CUSTOM permissions */}
                    {!permission.is_system && (
                        <>
                            <button
                                onClick={() => onToggle(permission)}
                                className={`p-1.5 rounded-lg ${permission.is_active
                                    ? 'text-slate-500 hover:bg-orange-50 hover:text-orange-600'
                                    : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
                                    }`}
                                title={permission.is_active ? 'Deactivate' : 'Activate'}
                            >
                                {permission.is_active ? <FiLock size={12} /> : <FiUnlock size={12} />}
                            </button>
                            <button
                                onClick={() => onDelete(permission)}
                                className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                                title="Delete"
                            >
                                <FiTrash2 size={12} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    </div>
);

// MAIN COMPONENT
const RolePermission = () => {
    const navigate = useNavigate();
    const location = useLocation();   
    const hasLoadedOnce = useRef(false);

    // Initialize active tab from URL
    const initialTab = location.pathname.startsWith('/admin/permissions') ? 'permissions' : 'roles';
    const [activeTab, setActiveTab] = useState(initialTab);

    // Loading
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Roles state
    const [roles, setRoles] = useState([]);
    const [rolesPagination, setRolesPagination] = useState({ total: 0, page: 1, limit: 12, total_pages: 1 });
    const [roleSearch, setRoleSearch] = useState('');
    const [roleTypeFilter, setRoleTypeFilter] = useState('all');
    const [rolePage, setRolePage] = useState(1);

    // Permissions state
    const [permissions, setPermissions] = useState([]);
    const [permissionModules, setPermissionModules] = useState([]);
    const [permissionModuleFilter, setPermissionModuleFilter] = useState('all');
    const [permissionSearch, setPermissionSearch] = useState('');

    // Modals
    const [roleFormOpen, setRoleFormOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [permissionFormOpen, setPermissionFormOpen] = useState(false);
    const [editingPermission, setEditingPermission] = useState(null);
    const [managePermissionsOpen, setManagePermissionsOpen] = useState(false);
    const [managingRole, setManagingRole] = useState(null);

    // Delete/Toggle confirm
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: null, item: null });
    const [toggleConfirm, setToggleConfirm] = useState({ open: false, type: null, item: null });
    const [deleting, setDeleting] = useState(false);

    // Debounced search
    const [debouncedRoleSearch, setDebouncedRoleSearch] = useState('');
    const [debouncedPermissionSearch, setDebouncedPermissionSearch] = useState('');

    // Sync activeTab with URL changes (for back button navigation)
    useEffect(() => {
        const tabFromUrl = location.pathname.startsWith('/admin/permissions') ? 'permissions' : 'roles';
        if (tabFromUrl !== activeTab) {
            setActiveTab(tabFromUrl);
        }
    }, [location.pathname]);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedRoleSearch(roleSearch), 400);
        return () => clearTimeout(t);
    }, [roleSearch]);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedPermissionSearch(permissionSearch), 400);
        return () => clearTimeout(t);
    }, [permissionSearch]);

    useEffect(() => { setRolePage(1); }, [debouncedRoleSearch, roleTypeFilter, activeTab]);

    // FETCH ROLES
    const fetchRoles = useCallback(async ({ silent = false } = {}) => {
        const showFullLoader = !hasLoadedOnce.current && !silent;
        if (showFullLoader) setLoading(true);
        else setRefreshing(true);

        try {
            const params = {
                page: rolePage,
                limit: 12,
                search: debouncedRoleSearch || undefined,
                role_type: roleTypeFilter !== 'all' ? roleTypeFilter : undefined
            };
            const res = await ApiService.getAllRoles(params);
            const data = res?.data || {};

            let list = [];
            if (Array.isArray(data.data)) list = data.data;
            else if (Array.isArray(data.roles)) list = data.roles;
            else if (Array.isArray(data)) list = data;

            const pag = data.pagination || {};

            setRoles(list);
            setRolesPagination({
                total: pag.total || list.length,
                page: pag.page || rolePage,
                limit: pag.limit || 12,
                total_pages: pag.totalPages || pag.total_pages || 1
            });
            hasLoadedOnce.current = true;
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to load roles');
            setRoles([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [rolePage, debouncedRoleSearch, roleTypeFilter]);

    // FETCH PERMISSIONS
    const fetchPermissions = useCallback(async ({ silent = false } = {}) => {
        if (!silent) setRefreshing(true);
        try {
            const params = {
                limit: 500,
                search: debouncedPermissionSearch || undefined,
                module_name: permissionModuleFilter !== 'all' ? permissionModuleFilter : undefined
            };
            const res = await ApiService.getAllPermissions(params);
            const data = res?.data || {};

            let list = [];
            if (Array.isArray(data.data)) list = data.data;
            else if (Array.isArray(data.permissions)) list = data.permissions;
            else if (Array.isArray(data)) list = data;

            setPermissions(list);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to load permissions');
            setPermissions([]);
        } finally {
            setRefreshing(false);
        }
    }, [debouncedPermissionSearch, permissionModuleFilter]);

    // FETCH MODULES 
    const fetchModules = useCallback(async () => {
        try {
            const res = await ApiService.getPermissionModules();
            const data = res?.data?.data || res?.data || [];
            setPermissionModules(Array.isArray(data) ? data : []);
        } catch {
            setPermissionModules([]);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'roles') fetchRoles();
    }, [activeTab, fetchRoles]);

    useEffect(() => {
        if (activeTab === 'permissions') {
            fetchPermissions();
            if (permissionModules.length === 0) fetchModules();
        }
    }, [activeTab, fetchPermissions, fetchModules, permissionModules.length]);

    // HANDLERS for tab change with URL update
    const handleTabChange = (tab) => {
        if (tab === activeTab) return;
        if (tab === 'roles') {
            navigate('/admin/roles', { replace: true });
        } else {
            navigate('/admin/permissions', { replace: true });
        }
    };

    // HANDLERS
    const handleRefresh = () => {
        if (activeTab === 'roles') fetchRoles({ silent: true });
        else fetchPermissions({ silent: true });
    };

    const openCreateRole = () => {
        setEditingRole(null);
        setRoleFormOpen(true);
    };

    const openEditRole = (role) => {
        setEditingRole(role);
        setRoleFormOpen(true);
    };

    const openManagePermissions = (role) => {
        setManagingRole(role);
        setManagePermissionsOpen(true);
    };

    const openCreatePermission = () => {
        setEditingPermission(null);
        setPermissionFormOpen(true);
    };

    const openEditPermission = (perm) => {
        setEditingPermission(perm);
        setPermissionFormOpen(true);
    };

    const openRoleView = (role) => {
        navigate(`/admin/roles/${role._id}`);
    };

    const openPermissionView = (permission) => {
        navigate(`/admin/permissions/${permission._id}`);
    };

    const handleDeleteClick = (type, item) => {
        setDeleteConfirm({ open: true, type, item });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm.item) return;
        setDeleting(true);
        try {
            if (deleteConfirm.type === 'role') {
                await ApiService.deleteRole(deleteConfirm.item._id);
                toast.success('Role deleted');
                fetchRoles({ silent: true });
            } else {
                await ApiService.deletePermission(deleteConfirm.item._id);
                toast.success('Permission deleted');
                fetchPermissions({ silent: true });
            }
            setDeleteConfirm({ open: false, type: null, item: null });
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Delete failed');
        } finally {
            setDeleting(false);
        }
    };

    const handleToggleClick = (type, item) => {
        setToggleConfirm({ open: true, type, item });
    };

    const handleToggleConfirm = async () => {
        if (!toggleConfirm.item) return;
        try {
            if (toggleConfirm.type === 'role') {
                await ApiService.toggleRoleStatus(toggleConfirm.item._id);
                toast.success('Role status updated');
                fetchRoles({ silent: true });
            } else {
                await ApiService.togglePermissionStatus(toggleConfirm.item._id);
                toast.success('Permission status updated');
                fetchPermissions({ silent: true });
            }
            setToggleConfirm({ open: false, type: null, item: null });
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Status update failed');
        }
    };

    const handleRoleFormSuccess = () => {
        setRoleFormOpen(false);
        setEditingRole(null);
        fetchRoles({ silent: true });
    };

    const handlePermissionFormSuccess = () => {
        setPermissionFormOpen(false);
        setEditingPermission(null);
        fetchPermissions({ silent: true });
        fetchModules();
    };

    const handleManagePermissionsSuccess = () => {
        setManagePermissionsOpen(false);
        setManagingRole(null);
        fetchRoles({ silent: true });
    };

    // GROUPED PERMISSIONS
    const groupedPermissions = permissions.reduce((acc, perm) => {
        const mod = perm.module_name || 'other';
        if (!acc[mod]) acc[mod] = [];
        acc[mod].push(perm);
        return acc;
    }, {});

    // RENDER
    return (
        <div className="min-h-screen min-w-0 overflow-x-hidden bg-slate-50">
            <AdminTopbar
                title="Roles & Permissions"
                subtitle="Manage system roles and their access permissions"
                actions={
                    <>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-sky-300 hover:bg-sky-50 disabled:opacity-60 sm:px-4"
                        >
                            <FiRefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                        {activeTab === 'roles' ? (
                            <button
                                onClick={openCreateRole}
                                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-blue-700 hover:to-sky-600 sm:px-5"
                            >
                                <FiPlus size={16} /> Add Role
                            </button>
                        ) : (
                            <button
                                onClick={openCreatePermission}
                                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-blue-700 hover:to-sky-600 sm:px-5"
                            >
                                <FiPlus size={16} /> Add Permission
                            </button>
                        )}
                    </>
                }
            />

            <main className="mx-auto w-full max-w-[1600px] space-y-5 p-4 sm:p-6">

                {/* TABS */}
                <div className="inline-flex w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm sm:w-auto">
                    <button
                        onClick={() => handleTabChange('roles')}
                        className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'roles'
                            ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md shadow-blue-200'
                            : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <span className="inline-flex items-center gap-2">
                            <FiShield size={15} />
                            Roles
                            {rolesPagination.total > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${activeTab === 'roles' ? 'bg-white/20' : 'bg-slate-100'
                                    }`}>
                                    {rolesPagination.total}
                                </span>
                            )}
                        </span>
                    </button>
                    <button
                        onClick={() => handleTabChange('permissions')}
                        className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'permissions'
                            ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md shadow-blue-200'
                            : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <span className="inline-flex items-center gap-2">
                            <FiKey size={15} />
                            Permissions
                            {permissions.length > 0 && activeTab === 'permissions' && (
                                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${activeTab === 'permissions' ? 'bg-white/20' : 'bg-slate-100'
                                    }`}>
                                    {permissions.length}
                                </span>
                            )}
                        </span>
                    </button>
                </div>

                {/* ROLES TAB */}
                {activeTab === 'roles' && (
                    <>
                        {/* Filters */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
                            <div className="flex items-center gap-2 mb-3 text-slate-700">
                                <FiFilter size={15} />
                                <span className="text-sm font-semibold">Filters</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="relative">
                                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search roles by name, key, description..."
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
                                <select
                                    value={roleTypeFilter}
                                    onChange={(e) => setRoleTypeFilter(e.target.value)}
                                    className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="all">All Types</option>
                                    {Object.entries(ROLE_TYPE_LABELS).map(([v, l]) => (
                                        <option key={v} value={v}>{l}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Loading */}
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-52 bg-sky-50 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : roles.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
                                <div className="p-4 bg-sky-50 rounded-full mb-4 inline-block">
                                    <FiShield size={28} className="text-sky-500" />
                                </div>
                                <h3 className="text-base font-semibold text-slate-800">No roles found</h3>
                                <p className="text-sm text-slate-500 mt-1">Try changing filters or add a new role</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {roles.map((role) => (
                                        <RoleCard
                                            key={role._id}
                                            role={role}
                                            onView={openRoleView}
                                            onManagePermissions={openManagePermissions}
                                            onEdit={openEditRole}
                                            onToggle={(r) => handleToggleClick('role', r)}
                                            onDelete={(r) => handleDeleteClick('role', r)}
                                        />
                                    ))}
                                </div>

                                {rolesPagination.total_pages > 1 && (
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
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
                    </>
                )}

                {/* PERMISSIONS TAB */}
                {activeTab === 'permissions' && (
                    <>
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
                            <div className="flex items-center gap-2 mb-3 text-slate-700">
                                <FiFilter size={15} />
                                <span className="text-sm font-semibold">Filters</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="relative">
                                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search permissions by name, key..."
                                        value={permissionSearch}
                                        onChange={(e) => setPermissionSearch(e.target.value)}
                                        className="min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-9 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                    />
                                    {permissionSearch && (
                                        <button
                                            onClick={() => setPermissionSearch('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            <FiX size={15} />
                                        </button>
                                    )}
                                </div>
                                <select
                                    value={permissionModuleFilter}
                                    onChange={(e) => setPermissionModuleFilter(e.target.value)}
                                    className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 capitalize"
                                >
                                    <option value="all">All Modules</option>
                                    {permissionModules.map((m) => (
                                        <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {Object.keys(groupedPermissions).length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
                                <div className="p-4 bg-sky-50 rounded-full mb-4 inline-block">
                                    <FiKey size={28} className="text-sky-500" />
                                </div>
                                <h3 className="text-base font-semibold text-slate-800">No permissions found</h3>
                                <p className="text-sm text-slate-500 mt-1">Try changing filters or add a new permission</p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {Object.entries(groupedPermissions).sort(([a], [b]) => a.localeCompare(b)).map(([module, perms]) => (
                                    <div key={module} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="px-5 py-3 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-white flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                                                    <FiLayers size={14} className="text-white" />
                                                </div>
                                                <span className="font-bold text-sm text-slate-800 capitalize">
                                                    {module.replace(/_/g, ' ')}
                                                </span>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                                                    {perms.length}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {perms.map((perm) => (
                                                <PermissionCard
                                                    key={perm._id}
                                                    permission={perm}
                                                    onView={openPermissionView}
                                                    onEdit={openEditPermission}
                                                    onToggle={(p) => handleToggleClick('permission', p)}
                                                    onDelete={(p) => handleDeleteClick('permission', p)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* MODALS */}

            <RoleFormModal
                isOpen={roleFormOpen}
                onClose={() => { setRoleFormOpen(false); setEditingRole(null); }}
                onSuccess={handleRoleFormSuccess}
                editingRole={editingRole}
            />

            <PermissionFormModal
                isOpen={permissionFormOpen}
                onClose={() => { setPermissionFormOpen(false); setEditingPermission(null); }}
                onSuccess={handlePermissionFormSuccess}
                editingPermission={editingPermission}
                modules={permissionModules}
            />

            <ManagePermissionsModal
                isOpen={managePermissionsOpen}
                onClose={() => { setManagePermissionsOpen(false); setManagingRole(null); }}
                onSuccess={handleManagePermissionsSuccess}
                role={managingRole}
            />

            {/* DELETE CONFIRM */}
            <AnimatePresence>
                {deleteConfirm.open && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => !deleting && setDeleteConfirm({ open: false, type: null, item: null })}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl sm:p-6"
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${deleteConfirm.item?.is_active ? 'bg-red-50' : 'bg-slate-50'
                                }`}>
                                <FiAlertCircle size={22} className="text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 text-center mt-4">
                                Delete {deleteConfirm.type === 'role' ? 'Role' : 'Permission'}?
                            </h3>
                            <p className="text-sm text-slate-500 text-center mt-2">
                                <b>{deleteConfirm.item?.role_name || deleteConfirm.item?.permission_name}</b> will be permanently deleted. This cannot be undone.
                            </p>

                            {/* 👇 CUSTOM ROLE delete attempt — with view details link */}
                            {deleteConfirm.type === 'role' && !deleteConfirm.item?.is_system_role && (
                                <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
                                    <p className="text-xs text-amber-800 mb-2">
                                        ⚠️ If this role is assigned to any user, deletion will be blocked. You'll need to unassign it first.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDeleteConfirm({ open: false, type: null, item: null });
                                            navigate(`/admin/roles/${deleteConfirm.item._id}`);
                                        }}
                                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white text-amber-700 border border-amber-300 text-xs font-semibold hover:bg-amber-100 transition-colors"
                                    >
                                        <FiUsers size={12} /> View Role Details & Assigned Users
                                    </button>
                                </div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setDeleteConfirm({ open: false, type: null, item: null })}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-2.5 border border-sky-200 text-slate-700 rounded-xl hover:bg-sky-50 font-medium disabled:opacity-60"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium disabled:opacity-60"
                                >
                                    {deleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TOGGLE CONFIRM */}
            <AnimatePresence>
                {toggleConfirm.open && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setToggleConfirm({ open: false, type: null, item: null })}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl sm:p-6"
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${toggleConfirm.item?.is_active ? 'bg-orange-50' : 'bg-emerald-50'
                                }`}>
                                {toggleConfirm.item?.is_active
                                    ? <FiLock size={22} className="text-orange-600" />
                                    : <FiUnlock size={22} className="text-emerald-600" />}
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 text-center mt-4">
                                {toggleConfirm.item?.is_active ? 'Deactivate' : 'Activate'} {toggleConfirm.type === 'role' ? 'Role' : 'Permission'}?
                            </h3>
                            <p className="text-sm text-slate-500 text-center mt-2">
                                <b>{toggleConfirm.item?.role_name || toggleConfirm.item?.permission_name}</b> will be {toggleConfirm.item?.is_active ? 'deactivated' : 'activated'}.
                            </p>
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setToggleConfirm({ open: false, type: null, item: null })}
                                    className="flex-1 px-4 py-2.5 border border-sky-200 text-slate-700 rounded-xl hover:bg-sky-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleToggleConfirm}
                                    className={`flex-1 px-4 py-2.5 text-white rounded-xl font-medium ${toggleConfirm.item?.is_active
                                        ? 'bg-orange-600 hover:bg-orange-700'
                                        : 'bg-emerald-600 hover:bg-emerald-700'
                                        }`}
                                >
                                    {toggleConfirm.item?.is_active ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RolePermission;