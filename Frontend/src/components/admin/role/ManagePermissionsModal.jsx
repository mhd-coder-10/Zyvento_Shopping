import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import {
    FiX, FiSave, FiKey, FiSearch, FiCheck, FiLayers,
    FiChevronDown, FiChevronRight, FiRefreshCw
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import ApiService from '../../../api/ApiService';

const ACTION_LABELS = {
    create: 'Create', read: 'Read', update: 'Update', delete: 'Delete',
    manage: 'Manage', approve: 'Approve', reject: 'Reject',
    export: 'Export', import: 'Import', assign: 'Assign', revoke: 'Revoke'
};

const ManagePermissionsModal = ({ isOpen, onClose, onSuccess, role }) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [allPermissions, setAllPermissions] = useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [expandedModules, setExpandedModules] = useState({});
    const [search, setSearch] = useState('');

    // Load permissions on open
    useEffect(() => {
        if (isOpen && role) {
            loadData();
        }
    }, [isOpen, role]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch all permissions
            const res = await ApiService.getAllPermissions({ limit: 1000 });
            const data = res?.data || {};
            let list = [];
            if (Array.isArray(data.data)) list = data.data;
            else if (Array.isArray(data.permissions)) list = data.permissions;
            else if (Array.isArray(data)) list = data;

            setAllPermissions(list);

            // Pre-select role's existing permissions
            const existingIds = new Set(
                (role.permission_ids || []).map((p) => String(p._id || p))
            );
            setSelectedIds(existingIds);

            // Expand all modules by default
            const modules = {};
            list.forEach((p) => {
                modules[p.module_name] = true;
            });
            setExpandedModules(modules);
        } catch (err) {
            toast.error('Failed to load permissions');
        } finally {
            setLoading(false);
        }
    };

    // Group permissions by module
    const grouped = useMemo(() => {
        const filtered = search
            ? allPermissions.filter((p) =>
                p.permission_name?.toLowerCase().includes(search.toLowerCase()) ||
                p.permission_key?.toLowerCase().includes(search.toLowerCase())
            )
            : allPermissions;

        return filtered.reduce((acc, perm) => {
            const mod = perm.module_name || 'other';
            if (!acc[mod]) acc[mod] = [];
            acc[mod].push(perm);
            return acc;
        }, {});
    }, [allPermissions, search]);

    const totalFiltered = Object.values(grouped).flat().length;
    const totalSelected = selectedIds.size;

    const togglePermission = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(String(id))) next.delete(String(id));
            else next.add(String(id));
            return next;
        });
    };

    const toggleModule = (moduleName) => {
        setExpandedModules((prev) => ({ ...prev, [moduleName]: !prev[moduleName] }));
    };

    const selectAllInModule = (moduleName) => {
        const perms = grouped[moduleName] || [];
        const allSelected = perms.every((p) => selectedIds.has(String(p._id)));

        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (allSelected) {
                perms.forEach((p) => next.delete(String(p._id)));
            } else {
                perms.forEach((p) => next.add(String(p._id)));
            }
            return next;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const permissionIds = Array.from(selectedIds);
            await ApiService.assignPermissionsToRole(role._id, {
                permission_ids: permissionIds
            });
            toast.success(`${permissionIds.length} permissions assigned`);
            onSuccess();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to save permissions');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen || !role) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-xl bg-white shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-md shrink-0">
                            <FiKey className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-lg font-bold text-slate-900 truncate">
                                Manage Permissions
                            </h3>
                            <p className="text-xs text-slate-500 truncate">
                                Role: <span className="font-semibold text-slate-700">{role.role_name}</span>
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100 shrink-0">
                        <FiX size={20} />
                    </button>
                </div>

                {/* Stats bar */}
                <div className="px-5 sm:px-6 py-3 bg-gradient-to-r from-sky-50 to-white border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
                    <p className="text-xs text-slate-600">
                        <span className="font-bold text-sky-700">{totalSelected}</span> of{' '}
                        <span className="font-bold text-slate-800">{totalFiltered}</span> permissions selected
                    </p>
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-800"
                    >
                        <FiRefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                        Reset
                    </button>
                </div>

                {/* Search */}
                <div className="px-5 sm:px-6 py-3 border-b border-slate-100 shrink-0">
                    <div className="relative">
                        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search permissions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6">
                    {loading ? (
                        <div className="py-12 text-center">
                            <FiRefreshCw size={24} className="animate-spin text-sky-500 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">Loading permissions...</p>
                        </div>
                    ) : Object.keys(grouped).length === 0 ? (
                        <div className="py-12 text-center">
                            <FiKey size={32} className="mx-auto text-slate-300 mb-2" />
                            <p className="text-sm text-slate-500">No permissions found</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([module, perms]) => {
                                const isExpanded = expandedModules[module] !== false;
                                const allSelected = perms.every((p) => selectedIds.has(String(p._id)));
                                const someSelected = perms.some((p) => selectedIds.has(String(p._id)));

                                return (
                                    <div key={module} className="rounded-xl border border-slate-200 overflow-hidden">
                                        {/* Module header */}
                                        <div className="px-3 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-3">
                                            <button
                                                type="button"
                                                onClick={() => toggleModule(module)}
                                                className="flex items-center gap-2 min-w-0 flex-1 text-left"
                                            >
                                                {isExpanded ? (
                                                    <FiChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                                                ) : (
                                                    <FiChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                                                )}
                                                <FiLayers size={14} className="text-sky-600 shrink-0" />
                                                <span className="font-semibold text-sm text-slate-800 capitalize truncate">
                                                    {module.replace(/_/g, ' ')}
                                                </span>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-semibold shrink-0">
                                                    {perms.filter((p) => selectedIds.has(String(p._id))).length}/{perms.length}
                                                </span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => selectAllInModule(module)}
                                                className={`text-[11px] font-semibold shrink-0 px-2 py-1 rounded-md transition-colors ${
                                                    allSelected
                                                        ? 'text-rose-600 hover:bg-rose-50'
                                                        : 'text-sky-600 hover:bg-sky-50'
                                                }`}
                                            >
                                                {allSelected ? 'Deselect All' : 'Select All'}
                                            </button>
                                        </div>

                                        {/* Permissions list */}
                                        {isExpanded && (
                                            <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                                {perms.map((perm) => {
                                                    const isSelected = selectedIds.has(String(perm._id));
                                                    return (
                                                        <label
                                                            key={perm._id}
                                                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                                                                isSelected
                                                                    ? 'bg-sky-50 border border-sky-200'
                                                                    : 'bg-white border border-slate-100 hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => togglePermission(perm._id)}
                                                                className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                                            />
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-xs font-medium text-slate-800 truncate">
                                                                    {perm.permission_name}
                                                                </p>
                                                                <p className="text-[10px] text-slate-400 font-mono truncate">
                                                                    {perm.action}
                                                                </p>
                                                            </div>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 sm:p-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-2.5 font-medium text-white shadow-lg shadow-blue-200 hover:from-blue-700 hover:to-sky-600 disabled:opacity-60"
                    >
                        <FiSave size={16} />
                        {saving ? 'Saving...' : `Save (${totalSelected})`}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ManagePermissionsModal;